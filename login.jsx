import { useState } from "react";
import "./login.css";
import logo from "../src/assets/logo2.png";

const ROLES = [
  { id: "admin", label: "Admin", icon: "⬡" },
  { id: "secretaire", label: "Secrétaire", icon: "◈" },
  { id: "professeur", label: "Professeur", icon: "◎" },
  { id: "eleve", label: "Élève", icon: "◇" },
];

export default function Login() {
  const [role, setRole] = useState("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!email.trim()) return "L'adresse email est requise.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return "Veuillez entrer un email valide.";
    if (!password) return "Le mot de passe est requis.";
    if (password.length < 6)
      return "Le mot de passe doit contenir au moins 6 caractères.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    try {
      const data = await login({ email, password, role });
      localStorage.setItem("token", data.token);
      if (remember) localStorage.setItem("rememberedEmail", email);
      window.location.href = "/dashboard";
    } catch (err) {
      setError("Email ou mot de passe incorrect");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-root">
      {/* Animated background */}
      <div className="bg-waves">
        <div className="wave wave-1" />
        <div className="wave wave-2" />
        <div className="wave wave-3" />
      </div>
      <div className="bg-shapes">
        <div className="shape shape-tl" />
        <div className="shape shape-br" />
        <div className="shape shape-tr" />
      </div>

      <main className="login-container">
        {/* Logo */}
        <div className="logo-block">
          <img src={logo} alt="EuroSchool Logo" className="logo"/>
          <div className="logo-text">
            <span className="logo-name">EuroSchool</span>
            <span className="logo-sub">System</span>
          </div>
        </div>

        {/* Card */}
        <div className="login-card">
          <div className="card-header">
            <h1 className="card-title">Se Connecter</h1>
            <p className="card-desc">Accédez à votre espace de gestion</p>
          </div>

          {/* Role Selector */}
          <div className="role-selector">
            {ROLES.map((r) => (
              <button
                key={r.id}
                type="button"
                className={`role-btn${role === r.id ? " active" : ""}`}
                onClick={() => setRole(r.id)}
              >
                
                <span className="role-label">{r.label}</span>
              </button>
            ))}
          </div>

          {/* Form */}
          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <div className="field-group">
              <label className="field-label" htmlFor="email">
                Adresse email
              </label>
              <div className="field-wrap">
                <span className="field-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="4" width="20" height="16" rx="3" />
                    <path d="M2 8l10 6 10-6" />
                  </svg>
                </span>
                <input
                  id="email"
                  type="email"
                  className="field-input"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="password">
                Mot de passe
              </label>
              <div className="field-wrap">
                <span className="field-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="field-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  aria-label="Afficher/masquer le mot de passe"
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="form-row">
              <label className="remember-label">
                <input
                  type="checkbox"
                  className="remember-check"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <span className="checkmark" />
                <span>Se souvenir de moi</span>
              </label>
              <a href="/forgot-password" className="forgot-link">
                Mot de passe oublié ?
              </a>
            </div>

            {error && (
              <div className="error-banner" role="alert">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              className={`submit-btn${loading ? " loading" : ""}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner" />
                  Connexion en cours…
                </>
              ) : (
                <>
                  Se connecter
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <p className="card-footer">
            Vous n'avez pas de compte ?{" "}
            <a href="/contact" className="contact-link">
              Contacter l'administration
            </a>
          </p>
        </div>

        <p className="copyright">© 2026 EuroSchool System · Tous droits réservés</p>
      </main>
    </div>
  );
}