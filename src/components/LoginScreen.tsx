import { useState } from "react";
import Icon from "@/components/ui/icon";

interface Props {
  onLogin: (user: { name: string; role: string }) => void;
  devMode: boolean;
}

export default function LoginScreen({ onLogin, devMode }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username || !password) { setError("Введите логин и пароль"); return; }
    setLoading(true);
    // TODO: заменить на реальный вызов бэкенда
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);
    setError("Авторизация через бэкенд будет подключена на финальном этапе");
  };

  const handleDevBypass = () => {
    onLogin({ name: "Администратор", role: "admin" });
  };

  return (
    <div className="min-h-screen flex font-golos" style={{ background: "linear-gradient(135deg, hsl(215,42%,10%) 0%, hsl(199,60%,14%) 100%)" }}>
      {/* Левая декоративная часть */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 relative overflow-hidden">
        {/* Фоновые круги */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-80px] left-[-80px] w-[400px] h-[400px] rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, hsl(199,85%,50%), transparent)" }} />
          <div className="absolute bottom-[-60px] right-[-60px] w-[300px] h-[300px] rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, hsl(162,60%,45%), transparent)" }} />
        </div>

        {/* Логотип */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, hsl(199,85%,50%), hsl(162,60%,45%))" }}>
            <Icon name="Heart" size={20} className="text-white" />
          </div>
          <div>
            <div className="text-white font-bold text-lg leading-tight">Ваш доктор</div>
            <div className="text-white/50 text-xs">Медицинская информационная система</div>
          </div>
        </div>

        {/* Центральный текст */}
        <div className="relative z-10">
          <h1 className="text-white text-4xl font-bold leading-snug mb-4">
            Всё необходимое<br />для вашей клиники
          </h1>
          <p className="text-white/50 text-base max-w-sm leading-relaxed">
            Расписание, пациенты, документы и финансы — в одном защищённом пространстве
          </p>

          {/* Фичи */}
          <div className="mt-10 space-y-3">
            {[
              { icon: "Lock", text: "Персданные пациентов шифруются по AES-256" },
              { icon: "Shield", text: "Разграниченный доступ по ролям" },
              { icon: "Clock", text: "Расписание с настраиваемым шагом сетки" },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: "rgba(255,255,255,0.08)" }}>
                  <Icon name={f.icon} size={14} className="text-white/70" />
                </div>
                <span className="text-white/60 text-sm">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-white/20 text-xs relative z-10">© 2026 Ваш доктор</div>
      </div>

      {/* Правая форма */}
      <div className="w-full lg:w-[440px] flex items-center justify-center p-8 bg-background/5 backdrop-blur-sm">
        <div className="w-full max-w-sm">
          {/* Мобильный логотип */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, hsl(199,85%,50%), hsl(162,60%,45%))" }}>
              <Icon name="Heart" size={18} className="text-white" />
            </div>
            <div className="text-white font-bold text-base">Ваш доктор</div>
          </div>

          <div className="bg-card rounded-2xl shadow-2xl p-8 border border-white/5">
            <h2 className="text-xl font-bold text-foreground mb-1">Вход в систему</h2>
            <p className="text-sm text-muted-foreground mb-6">Введите данные учётной записи</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Логин */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Логин</label>
                <div className="relative">
                  <Icon name="User" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="admin"
                    autoComplete="username"
                    className="w-full pl-9 pr-4 py-2.5 border border-border rounded-lg text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                  />
                </div>
              </div>

              {/* Пароль */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Пароль</label>
                <div className="relative">
                  <Icon name="Lock" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full pl-9 pr-10 py-2.5 border border-border rounded-lg text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                  />
                  <button type="button" onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    <Icon name={showPass ? "EyeOff" : "Eye"} size={15} />
                  </button>
                </div>
              </div>

              {/* Ошибка */}
              {error && (
                <div className="flex items-start gap-2 px-3 py-2.5 bg-red-50 border border-red-100 rounded-lg">
                  <Icon name="AlertCircle" size={14} className="text-red-500 mt-0.5 shrink-0" />
                  <span className="text-xs text-red-600">{error}</span>
                </div>
              )}

              {/* Кнопка входа */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, hsl(199,85%,38%), hsl(162,60%,40%))" }}
              >
                {loading ? (
                  <><Icon name="Loader2" size={15} className="animate-spin" />Вход...</>
                ) : (
                  <><Icon name="LogIn" size={15} />Войти</>
                )}
              </button>
            </form>

            {/* Разделитель */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">или</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Dev bypass */}
            {devMode && (
              <button
                onClick={handleDevBypass}
                className="w-full py-2.5 rounded-lg text-sm font-medium border border-dashed border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-all flex items-center justify-center gap-2"
              >
                <Icon name="Zap" size={14} className="text-yellow-500" />
                Войти без авторизации
                <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded font-semibold">DEV</span>
              </button>
            )}

            <p className="text-center text-xs text-muted-foreground mt-4">
              Забыли пароль? Обратитесь к администратору
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
