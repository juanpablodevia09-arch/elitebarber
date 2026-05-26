import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth, primaryRole, homePathFor } from "@/hooks/use-auth";
import heroImg from "@/assets/barber-hero.jpg";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { user, roles, loading, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: homePathFor(primaryRole(roles)) });
  }, [loading, user, roles, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "login") {
        await signIn(email, password);
        toast.success("Bienvenido de nuevo");
      } else {
        await signUp(email, password, name, phone);
        toast.success("Cuenta creada. Ya puedes iniciar sesión.");
        setMode("login");
      }
    } catch (err: unknown) {
      const m = err instanceof Error ? err.message : "Algo salió mal";
      toast.error(m);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left brand panel */}
      <div
        className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(180deg, oklch(0.12 0.005 60 / 0.55), oklch(0.10 0.005 60 / 0.92)), url(${heroImg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-gold flex items-center justify-center shadow-gold">
            <Scissors className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-lg tracking-tight">EliteBarber</span>
        </div>
        <div className="max-w-md animate-slide-up">
          <div className="text-xs uppercase tracking-[0.24em] text-gold mb-4">Acceso de Miembros</div>
          <h2 className="text-4xl xl:text-5xl font-semibold leading-tight text-foreground">
            La plataforma premium para la gestión moderna de barberías.
          </h2>
          <p className="mt-6 text-sm text-muted-foreground leading-relaxed">
            Reservas curadas, horarios inteligentes y una experiencia refinada para clientes, barberos y dueños.
          </p>
        </div>
        <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          Diseñado para el atelier moderno · Est. 2026
        </div>
      </div>

      {/* Right form */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm animate-fade-in">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl gradient-gold flex items-center justify-center shadow-gold">
              <Scissors className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg tracking-tight">EliteBarber</span>
          </div>

          <h1 className="text-3xl font-semibold tracking-tight">
            {mode === "login" ? "Iniciar sesión" : "Crea tu cuenta"}
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            {mode === "login"
              ? "Bienvenido de nuevo. Ingresa tus datos para continuar."
              : "Solo cuentas de cliente. Los barberos son agregados por el administrador del estudio."}
          </p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            {mode === "register" && (
              <div className="space-y-2">
                <Label htmlFor="name">Nombre completo</Label>
                <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Juan Pérez" />
              </div>
            )}
            {mode === "register" && (
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input id="phone" type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+52 555 123 4567" />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@ejemplo.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <Button
              type="submit"
              disabled={busy}
              className="w-full gradient-gold text-primary-foreground hover:opacity-90 shadow-gold border-0 font-medium"
            >
              {busy ? "Por favor espera…" : mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "login" ? (
              <>
                ¿Nuevo en EliteBarber?{" "}
                <button onClick={() => setMode("register")} className="text-gold hover:underline">
                  Crear una cuenta de cliente
                </button>
              </>
            ) : (
              <>
                ¿Ya tienes una cuenta?{" "}
                <button onClick={() => setMode("login")} className="text-gold hover:underline">
                  Iniciar sesión
                </button>
              </>
            )}
          </div>

          <p className="mt-8 text-[11px] text-center text-muted-foreground">
            Las cuentas de barbero y administrador son creadas por el estudio.
          </p>
        </div>
      </div>
    </div>
  );
}