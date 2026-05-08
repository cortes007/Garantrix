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
  credentials: true,
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
   SCHEMAS & MODELS
───────────────────────────────────────────── */
 
// USERS
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
 
// CLIENTS
const clientSchema = new mongoose.Schema(
  {
    userId:  { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name:    { type: String, required: true, trim: true },
    email:   { type: String, required: true, trim: true },
    phone:   { type: String, trim: true },
    active:  { type: Boolean, default: true },
  },
  { timestamps: true }
);
const Client = mongoose.model("Client", clientSchema);
 
// WARRANTIES
const warrantySchema = new mongoose.Schema(
  {
    userId:        { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    clientId:      { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true },
    warrantyCode:  { type: String, unique: true },
    product:       { type: String, required: true, trim: true },
    description:   { type: String, trim: true },
    invoiceNumber: { type: String, trim: true },
    purchaseDate:  { type: Date, required: true },
    startDate:     { type: Date, required: true },
    endDate:       { type: Date, required: true },
    status: {
      type: String,
      enum: ["ACTIVA", "VENCIDA", "RECLAMACIÓN", "RESUELTA"],
      default: "ACTIVA",
    },
    qrData: { type: String },
  },
  { timestamps: true }
);
 
warrantySchema.pre("save", async function (next) {
  if (!this.warrantyCode) {
    const count = await Warranty.countDocuments();
    this.warrantyCode = `#GTX-${String(9900 + count + 1).padStart(4, "0")}`;
    this.qrData = `${process.env.CLIENT_URL || "http://localhost:5173"}/warranty/${this.warrantyCode}`;
  }
  next();
});
const Warranty = mongoose.model("Warranty", warrantySchema);
 
// CLAIMS
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
    resolvedAt: { type: Date },
    notes:      { type: String },
  },
  { timestamps: true }
);
const Claim = mongoose.model("Claim", claimSchema);
 
/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
const JWT_SECRET  = process.env.JWT_SECRET  || "garantix_secret_key_change_in_prod";
const JWT_EXPIRES = "7d";
 
const generateToken = (user) =>
  jwt.sign(
    { id: user._id, businessName: user.businessName, email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );
 
const setCookieToken = (res, token) =>
  res.cookie("gtx_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
 
// ── Middleware de autenticación ──────────────
const requireAuth = (req, res, next) => {
  const token = req.cookies.gtx_token;
  if (!token) return res.status(401).json({ message: "No autenticado" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
};
 
// ── Auto-vencer garantías expiradas ──────────
const autoExpireWarranties = async () => {
  try {
    const result = await Warranty.updateMany(
      { endDate: { $lt: new Date() }, status: "ACTIVA" },
      { $set: { status: "VENCIDA" } }
    );
    if (result.modifiedCount > 0)
      console.log(`⏰ ${result.modifiedCount} garantía(s) marcadas como VENCIDA`);
  } catch (err) {
    console.error("Error al vencer garantías:", err);
  }
};
 
// Ejecutar al iniciar y cada hora
mongoose.connection.once("open", () => {
  autoExpireWarranties();
  setInterval(autoExpireWarranties, 60 * 60 * 1000);
});
 
/* ─────────────────────────────────────────────
   RUTAS: AUTH
───────────────────────────────────────────── */
 
// POST /api/auth/register
app.post("/api/auth/register", async (req, res) => {
  try {
    const { businessName, email, phone, password } = req.body;
    if (!businessName || !email || !phone || !password)
      return res.status(400).json({ message: "Todos los campos son requeridos" });
 
    if (await User.findOne({ email }))
      return res.status(409).json({ message: "Ya existe una cuenta con este email" });
 
    const hashed = await bcrypt.hash(password, 12);
    const user   = await User.create({ businessName, email, phone, password: hashed });
 
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
    if (!user || !(await bcrypt.compare(password, user.password)))
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
 
// GET /api/auth/me
app.get("/api/auth/me", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
    res.json({ user: { _id: user._id, businessName: user.businessName, email: user.email, phone: user.phone } });
  } catch {
    res.status(500).json({ message: "Error interno" });
  }
});
 
// PUT /api/auth/profile — actualizar datos del negocio
app.put("/api/auth/profile", requireAuth, async (req, res) => {
  try {
    const { businessName, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { businessName, phone },
      { new: true, runValidators: true }
    ).select("-password");
    res.json({ user });
  } catch {
    res.status(500).json({ message: "Error al actualizar perfil" });
  }
});
 
// PUT /api/auth/change-password
app.put("/api/auth/change-password", requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: "Campos requeridos" });
 
    const user = await User.findById(req.user.id);
    if (!(await bcrypt.compare(currentPassword, user.password)))
      return res.status(401).json({ message: "Contraseña actual incorrecta" });
 
    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();
    res.json({ message: "Contraseña actualizada" });
  } catch {
    res.status(500).json({ message: "Error al cambiar contraseña" });
  }
});
 
/* ─────────────────────────────────────────────
   RUTAS: CLIENTES
───────────────────────────────────────────── */
 
// GET /api/clients — listar + búsqueda
app.get("/api/clients", requireAuth, async (req, res) => {
  try {
    const { search } = req.query;
    const filter = { userId: req.user.id };
 
    if (search) {
      filter.$or = [
        { name:  { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }
 
    const clients = await Client.find(filter).sort({ createdAt: -1 });
    res.json({ clients });
  } catch {
    res.status(500).json({ message: "Error al obtener clientes" });
  }
});
 
// GET /api/clients/:id — obtener uno
app.get("/api/clients/:id", requireAuth, async (req, res) => {
  try {
    const client = await Client.findOne({ _id: req.params.id, userId: req.user.id });
    if (!client) return res.status(404).json({ message: "Cliente no encontrado" });
    res.json({ client });
  } catch {
    res.status(500).json({ message: "Error al obtener cliente" });
  }
});
 
// POST /api/clients — crear
app.post("/api/clients", requireAuth, async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    if (!name || !email)
      return res.status(400).json({ message: "Nombre y email son requeridos" });
 
    const client = await Client.create({ userId: req.user.id, name, email, phone });
    res.status(201).json({ client });
  } catch (err) {
    if (err.code === 11000)
      return res.status(409).json({ message: "Ya existe un cliente con ese email" });
    res.status(500).json({ message: "Error al crear cliente" });
  }
});
 
// PUT /api/clients/:id — editar
app.put("/api/clients/:id", requireAuth, async (req, res) => {
  try {
    const { name, email, phone, active } = req.body;
    const client = await Client.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { name, email, phone, active },
      { new: true, runValidators: true }
    );
    if (!client) return res.status(404).json({ message: "Cliente no encontrado" });
    res.json({ client });
  } catch {
    res.status(500).json({ message: "Error al actualizar cliente" });
  }
});
 
// DELETE /api/clients/:id
app.delete("/api/clients/:id", requireAuth, async (req, res) => {
  try {
    // Verificar si tiene garantías activas
    const hasWarranties = await Warranty.findOne({ clientId: req.params.id, status: "ACTIVA" });
    if (hasWarranties)
      return res.status(400).json({ message: "No se puede eliminar: el cliente tiene garantías activas" });
 
    const client = await Client.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!client) return res.status(404).json({ message: "Cliente no encontrado" });
    res.json({ message: "Cliente eliminado" });
  } catch {
    res.status(500).json({ message: "Error al eliminar cliente" });
  }
});
 
/* ─────────────────────────────────────────────
   RUTAS: GARANTÍAS
───────────────────────────────────────────── */
 
// GET /api/warranties — listar con filtros
app.get("/api/warranties", requireAuth, async (req, res) => {
  try {
    const { status, search, clientId } = req.query;
    const filter = { userId: req.user.id };
 
    if (status)   filter.status   = status;
    if (clientId) filter.clientId = clientId;
    if (search) {
      filter.$or = [
        { product:       { $regex: search, $options: "i" } },
        { warrantyCode:  { $regex: search, $options: "i" } },
        { invoiceNumber: { $regex: search, $options: "i" } },
      ];
    }
 
    const warranties = await Warranty.find(filter)
      .populate("clientId", "name email phone")
      .sort({ createdAt: -1 });
 
    res.json({ warranties });
  } catch {
    res.status(500).json({ message: "Error al obtener garantías" });
  }
});
 
// GET /api/warranties/public/:code — validación pública por QR (sin auth)
app.get("/api/warranties/public/:code", async (req, res) => {
  try {
    const warranty = await Warranty.findOne({ warrantyCode: req.params.code })
      .populate("clientId", "name email phone")
      .populate("userId", "businessName phone");
    if (!warranty) return res.status(404).json({ message: "Garantía no encontrada" });
    res.json({ warranty });
  } catch {
    res.status(500).json({ message: "Error al buscar garantía" });
  }
});
 
// GET /api/warranties/:id — obtener una (protegida)
app.get("/api/warranties/:id", requireAuth, async (req, res) => {
  try {
    const warranty = await Warranty.findOne({ _id: req.params.id, userId: req.user.id })
      .populate("clientId", "name email phone");
    if (!warranty) return res.status(404).json({ message: "Garantía no encontrada" });
    res.json({ warranty });
  } catch {
    res.status(500).json({ message: "Error al obtener garantía" });
  }
});
 
// POST /api/warranties — crear
app.post("/api/warranties", requireAuth, async (req, res) => {
  try {
    const { clientId, product, description, invoiceNumber, purchaseDate, startDate, endDate } = req.body;
    if (!clientId || !product || !purchaseDate || !startDate || !endDate)
      return res.status(400).json({ message: "Faltan campos requeridos" });
 
    // Verificar que el cliente pertenece al usuario
    const client = await Client.findOne({ _id: clientId, userId: req.user.id });
    if (!client) return res.status(404).json({ message: "Cliente no encontrado" });
 
    const warranty = await Warranty.create({
      userId: req.user.id, clientId, product, description,
      invoiceNumber, purchaseDate, startDate, endDate,
    });
 
    const populated = await warranty.populate("clientId", "name email phone");
    res.status(201).json({ warranty: populated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al crear garantía" });
  }
});
 
// PUT /api/warranties/:id — editar
app.put("/api/warranties/:id", requireAuth, async (req, res) => {
  try {
    const { product, description, invoiceNumber, purchaseDate, startDate, endDate, status } = req.body;
    const warranty = await Warranty.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { product, description, invoiceNumber, purchaseDate, startDate, endDate, status },
      { new: true, runValidators: true }
    ).populate("clientId", "name email phone");
 
    if (!warranty) return res.status(404).json({ message: "Garantía no encontrada" });
    res.json({ warranty });
  } catch {
    res.status(500).json({ message: "Error al actualizar garantía" });
  }
});
 
// DELETE /api/warranties/:id
app.delete("/api/warranties/:id", requireAuth, async (req, res) => {
  try {
    const warranty = await Warranty.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!warranty) return res.status(404).json({ message: "Garantía no encontrada" });
 
    // Eliminar reclamaciones asociadas
    await Claim.deleteMany({ warrantyId: req.params.id });
 
    res.json({ message: "Garantía eliminada" });
  } catch {
    res.status(500).json({ message: "Error al eliminar garantía" });
  }
});
 
/* ─────────────────────────────────────────────
   RUTAS: RECLAMACIONES
───────────────────────────────────────────── */
 
// GET /api/claims — listar con filtros
app.get("/api/claims", requireAuth, async (req, res) => {
  try {
    const { status, warrantyId } = req.query;
    const filter = { userId: req.user.id };
 
    if (status)     filter.status     = status;
    if (warrantyId) filter.warrantyId = warrantyId;
 
    const claims = await Claim.find(filter)
      .populate({
        path: "warrantyId",
        select: "warrantyCode product status clientId",
        populate: { path: "clientId", select: "name email" },
      })
      .sort({ createdAt: -1 });
 
    res.json({ claims });
  } catch {
    res.status(500).json({ message: "Error al obtener reclamaciones" });
  }
});
 
// GET /api/claims/:id — obtener una
app.get("/api/claims/:id", requireAuth, async (req, res) => {
  try {
    const claim = await Claim.findOne({ _id: req.params.id, userId: req.user.id })
      .populate({
        path: "warrantyId",
        select: "warrantyCode product status clientId",
        populate: { path: "clientId", select: "name email phone" },
      });
    if (!claim) return res.status(404).json({ message: "Reclamación no encontrada" });
    res.json({ claim });
  } catch {
    res.status(500).json({ message: "Error al obtener reclamación" });
  }
});
 
// POST /api/claims — crear
app.post("/api/claims", requireAuth, async (req, res) => {
  try {
    const { warrantyId, description } = req.body;
    if (!warrantyId || !description)
      return res.status(400).json({ message: "warrantyId y descripción son requeridos" });
 
    // Verificar que la garantía existe y pertenece al usuario
    const warranty = await Warranty.findOne({ _id: warrantyId, userId: req.user.id });
    if (!warranty) return res.status(404).json({ message: "Garantía no encontrada" });
    if (warranty.status === "VENCIDA")
      return res.status(400).json({ message: "No se puede reclamar una garantía vencida" });
 
    const claim = await Claim.create({ warrantyId, userId: req.user.id, description });
    await Warranty.findByIdAndUpdate(warrantyId, { status: "RECLAMACIÓN" });
 
    res.status(201).json({ claim });
  } catch {
    res.status(500).json({ message: "Error al crear reclamación" });
  }
});
 
// PUT /api/claims/:id — actualizar status y notas
app.put("/api/claims/:id", requireAuth, async (req, res) => {
  try {
    const { status, notes } = req.body;
    const update = { status, notes };
 
    // Si se resuelve, registrar fecha y actualizar garantía
    if (status === "RESUELTA") {
      update.resolvedAt = new Date();
    }
 
    const claim = await Claim.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      update,
      { new: true, runValidators: true }
    );
    if (!claim) return res.status(404).json({ message: "Reclamación no encontrada" });
 
    // Sincronizar estado de la garantía
    if (status === "RESUELTA") {
      await Warranty.findByIdAndUpdate(claim.warrantyId, { status: "RESUELTA" });
    }
 
    res.json({ claim });
  } catch {
    res.status(500).json({ message: "Error al actualizar reclamación" });
  }
});
 
// DELETE /api/claims/:id
app.delete("/api/claims/:id", requireAuth, async (req, res) => {
  try {
    const claim = await Claim.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!claim) return res.status(404).json({ message: "Reclamación no encontrada" });
 
    // Revertir estado de garantía a ACTIVA si ya no tiene reclamaciones pendientes
    const pendingClaims = await Claim.findOne({
      warrantyId: claim.warrantyId,
      status: { $in: ["PENDIENTE", "EN_PROCESO"] },
    });
    if (!pendingClaims) {
      const warranty = await Warranty.findById(claim.warrantyId);
      if (warranty && warranty.status === "RECLAMACIÓN") {
        await Warranty.findByIdAndUpdate(claim.warrantyId, { status: "ACTIVA" });
      }
    }
 
    res.json({ message: "Reclamación eliminada" });
  } catch {
    res.status(500).json({ message: "Error al eliminar reclamación" });
  }
});
 
/* ─────────────────────────────────────────────
   RUTAS: DASHBOARD / ESTADÍSTICAS
───────────────────────────────────────────── */
 
// GET /api/stats — resumen para el dashboard
app.get("/api/stats", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
 
    const [
      totalWarranties,
      activeWarranties,
      expiredWarranties,
      claimWarranties,
      resolvedWarranties,
      totalClients,
      totalClaims,
      pendingClaims,
      recentWarranties,
    ] = await Promise.all([
      Warranty.countDocuments({ userId }),
      Warranty.countDocuments({ userId, status: "ACTIVA" }),
      Warranty.countDocuments({ userId, status: "VENCIDA" }),
      Warranty.countDocuments({ userId, status: "RECLAMACIÓN" }),
      Warranty.countDocuments({ userId, status: "RESUELTA" }),
      Client.countDocuments({ userId }),
      Claim.countDocuments({ userId }),
      Claim.countDocuments({ userId, status: "PENDIENTE" }),
      Warranty.find({ userId })
        .populate("clientId", "name")
        .sort({ createdAt: -1 })
        .limit(5)
        .select("warrantyCode product status createdAt clientId"),
    ]);
 
    res.json({
      warranties: {
        total:      totalWarranties,
        active:     activeWarranties,
        expired:    expiredWarranties,
        inClaim:    claimWarranties,
        resolved:   resolvedWarranties,
      },
      clients: { total: totalClients },
      claims:  { total: totalClaims, pending: pendingClaims },
      recentWarranties,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al obtener estadísticas" });
  }
});
 
/* ─────────────────────────────────────────────
   START SERVER
───────────────────────────────────────────── */
const PORT = process.env.PORT || 3001;
app.listen(PORT, () =>
  console.log(`🚀 Servidor Garantrix corriendo en puerto ${PORT}`)
);