// server/index.js
import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

/* ─────────────────────────────────────────────
   MIDDLEWARE
───────────────────────────────────────────── */
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,              // permite enviar/recibir cookies
}));
app.use(express.json());
app.use(cookieParser());

/* ─────────────────────────────────────────────
   MONGODB CONNECTION
───────────────────────────────────────────── */
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/garantix_db")
  .then(() => console.log("✅ MongoDB conectado — garantix_db"))
  .catch((err) => console.error("❌ Error MongoDB:", err));

/* ─────────────────────────────────────────────
   COLECCIÓN: users
───────────────────────────────────────────── */
const userSchema = new mongoose.Schema(
  {
    businessName: { type: String, required: true, trim: true },
    email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone:        { type: String, required: true, trim: true },
    password:     { type: String, required: true },
    active:       { type: Boolean, default: true },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

/* ─────────────────────────────────────────────
   COLECCIÓN: clients
   (referenciada al user/negocio dueño)
───────────────────────────────────────────── */
const clientSchema = new mongoose.Schema(
  {
    userId:       { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name:         { type: String, required: true },
    email:        { type: String, required: true },
    phone:        { type: String },
    active:       { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Client = mongoose.model("Client", clientSchema);

/* ─────────────────────────────────────────────
   COLECCIÓN: warranties
───────────────────────────────────────────── */
const warrantySchema = new mongoose.Schema(
  {
    userId:       { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    clientId:     { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true },
    warrantyCode: { type: String, unique: true },         // #GTX-XXXX (generado automáticamente)
    product:      { type: String, required: true },
    description:  { type: String },
    invoiceNumber:{ type: String },
    purchaseDate: { type: Date, required: true },
    startDate:    { type: Date, required: true },
    endDate:      { type: Date, required: true },
    status: {
      type: String,
      enum: ["ACTIVA", "VENCIDA", "RECLAMACIÓN", "RESUELTA"],
      default: "ACTIVA",
    },
    qrData:       { type: String },                       // URL o ID codificado en el QR
  },
  { timestamps: true }
);

// Auto-generar warrantyCode antes de guardar
warrantySchema.pre("save", async function (next) {
  if (!this.warrantyCode) {
    const count = await Warranty.countDocuments();
    this.warrantyCode = `#GTX-${String(9900 + count + 1).padStart(4, "0")}`;
    this.qrData = `${process.env.CLIENT_URL || "http://localhost:5173"}/warranty/${this.warrantyCode}`;
  }
  next();
});

const Warranty = mongoose.model("Warranty", warrantySchema);

/* ─────────────────────────────────────────────
   COLECCIÓN: claims
───────────────────────────────────────────── */
const claimSchema = new mongoose.Schema(
  {
    warrantyId:  { type: mongoose.Schema.Types.ObjectId, ref: "Warranty", required: true },
    userId:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ["PENDIENTE", "EN_PROCESO", "RESUELTA"],
      default: "PENDIENTE",
    },
    resolvedAt:  { type: Date },
    notes:       { type: String },
  },
  { timestamps: true }
);

const Claim = mongoose.model("Claim", claimSchema);

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
const JWT_SECRET = process.env.JWT_SECRET || "garantix_secret_key_change_in_prod";
const JWT_EXPIRES = "7d";

const generateToken = (user) =>
  jwt.sign(
    { id: user._id, businessName: user.businessName, email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );

const setCookieToken = (res, token) =>
  res.cookie("gtx_token", token, {
    httpOnly: true,           // no accesible desde JS → protege contra XSS
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días en ms
  });

// Middleware de autenticación
const requireAuth = (req, res, next) => {
  const token = req.cookies.gtx_token;
  if (!token) return res.status(401).json({ message: "No autenticado" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
};

/* ─────────────────────────────────────────────
   RUTAS: AUTH
───────────────────────────────────────────── */

// POST /api/auth/register
app.post("/api/auth/register", async (req, res) => {
  try {
    const { businessName, email, phone, password } = req.body;

    if (!businessName || !email || !phone || !password)
      return res.status(400).json({ message: "Todos los campos son requeridos" });

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(409).json({ message: "Ya existe una cuenta con este email" });

    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({ businessName, email, phone, password: hashed });

    const token = generateToken(user);
    setCookieToken(res, token);

    res.status(201).json({
      message: "Cuenta creada exitosamente",
      user: { _id: user._id, businessName: user.businessName, email: user.email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// POST /api/auth/login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email y contraseña requeridos" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: "Credenciales incorrectas" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(401).json({ message: "Credenciales incorrectas" });

    if (!user.active)
      return res.status(403).json({ message: "Cuenta desactivada. Contacta a soporte." });

    const token = generateToken(user);
    setCookieToken(res, token);

    res.json({
      message: "Sesión iniciada",
      user: { _id: user._id, businessName: user.businessName, email: user.email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// POST /api/auth/logout
app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("gtx_token");
  res.json({ message: "Sesión cerrada" });
});

// GET /api/auth/me  → verifica sesión activa al recargar la app
app.get("/api/auth/me", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
    res.json({ user: { _id: user._id, businessName: user.businessName, email: user.email } });
  } catch {
    res.status(500).json({ message: "Error interno" });
  }
});

/* ─────────────────────────────────────────────
   RUTAS: GARANTÍAS (protegidas)
───────────────────────────────────────────── */

// GET /api/warranties
app.get("/api/warranties", requireAuth, async (req, res) => {
  try {
    const warranties = await Warranty.find({ userId: req.user.id })
      .populate("clientId", "name email phone")
      .sort({ createdAt: -1 });
    res.json({ warranties });
  } catch {
    res.status(500).json({ message: "Error al obtener garantías" });
  }
});

// POST /api/warranties
app.post("/api/warranties", requireAuth, async (req, res) => {
  try {
    const { clientId, product, description, invoiceNumber, purchaseDate, startDate, endDate } = req.body;
    const warranty = await Warranty.create({
      userId: req.user.id, clientId, product, description,
      invoiceNumber, purchaseDate, startDate, endDate,
    });
    res.status(201).json({ warranty });
  } catch (err) {
    res.status(500).json({ message: "Error al crear garantía" });
  }
});

// GET /api/warranties/:code  → validación pública por QR
app.get("/api/warranties/:code", async (req, res) => {
  try {
    const warranty = await Warranty.findOne({ warrantyCode: req.params.code })
      .populate("clientId", "name email phone")
      .populate("userId", "businessName");
    if (!warranty) return res.status(404).json({ message: "Garantía no encontrada" });
    res.json({ warranty });
  } catch {
    res.status(500).json({ message: "Error al buscar garantía" });
  }
});

/* ─────────────────────────────────────────────
   RUTAS: CLIENTES (protegidas)
───────────────────────────────────────────── */

// GET /api/clients
app.get("/api/clients", requireAuth, async (req, res) => {
  try {
    const clients = await Client.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ clients });
  } catch {
    res.status(500).json({ message: "Error al obtener clientes" });
  }
});

// POST /api/clients
app.post("/api/clients", requireAuth, async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const client = await Client.create({ userId: req.user.id, name, email, phone });
    res.status(201).json({ client });
  } catch {
    res.status(500).json({ message: "Error al crear cliente" });
  }
});

/* ─────────────────────────────────────────────
   RUTAS: RECLAMACIONES (protegidas)
───────────────────────────────────────────── */

// POST /api/claims
app.post("/api/claims", requireAuth, async (req, res) => {
  try {
    const { warrantyId, description } = req.body;
    const claim = await Claim.create({ warrantyId, userId: req.user.id, description });

    // Actualizar estado de la garantía a RECLAMACIÓN
    await Warranty.findByIdAndUpdate(warrantyId, { status: "RECLAMACIÓN" });

    res.status(201).json({ claim });
  } catch {
    res.status(500).json({ message: "Error al crear reclamación" });
  }
});

/* ─────────────────────────────────────────────
   START SERVER
───────────────────────────────────────────── */
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Servidor Garantix corriendo en puerto ${PORT}`));