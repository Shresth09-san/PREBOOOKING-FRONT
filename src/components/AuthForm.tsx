import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface AuthFormProps {
  mode: "login" | "signup";
  role?: "homeowner" | "provider" | "admin";
}

const AuthForm = ({ mode, role }: AuthFormProps) => {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userrole, setUserrole] = useState(role);
  const isAdmin = role === "admin";
  const [name, setName] = useState("");
  const [mobnumber, setMobnumber] = useState("");
  const [UseEmailLogin, setUseEmailLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<"homeowner" | "provider" | "admin">(isAdmin ? "admin" : role || "homeowner");

  useEffect(() => {
    if (UseEmailLogin) {
      navigate("/emaillogin", { state: { role: userrole } });
    }
  }, [UseEmailLogin, navigate, userrole]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          mode === "login"
            ? { password, mobnumber, role: selectedRole }
            : { name, email, password, mobnumber, role: selectedRole }
        ),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Authentication failed.");
      if (!data || !data.token || !data.user) throw new Error("Invalid response from server.");

      localStorage.setItem("doit-token", data.token);
      setUser(data.user);
      navigate(data.user.role === "admin" ? "/admin" : "/dashboard");
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
      {mode === "signup" && (
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            placeholder="e.g., John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={3}
            maxLength={60}
            pattern="^[A-Za-zÀ-ÖØ-öø-ÿ'’\- ]{3,60}$"
            title="Name can contain letters, spaces, hyphens, and apostrophes only."
            className="h-12"
          />
          {name.length > 0 && !/^[A-Za-zÀ-ÖØ-öø-ÿ'’\- ]{3,60}$/.test(name) && (
            <p className="text-red-500 text-sm">
              Please enter a valid name (letters, spaces, hyphens, and apostrophes only).
            </p>
          )}
        </div>
      )}

      {mode === "signup" && (
        <div className="space-y-2">
          <Label htmlFor="mobnumber">Mobile Number</Label>
          <Input
            id="mobnumber"
            type="tel"
            placeholder="e.g. +14155552671"
            value={mobnumber}
            onChange={(e) => setMobnumber(e.target.value)}
            pattern="^\+[1-9]\d{1,14}$"
            required
            className="h-12"
          />
          {mobnumber && !/^\+[1-9]\d{1,14}$/.test(mobnumber) && (
            <p className="text-red-500 text-sm">
              Please enter a valid international mobile number (e.g. +14155552671).
            </p>
          )}
        </div>
      )}

      {mode === "signup" && (
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="e.g. john.doe@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-12"
          />
          {email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (
            <p className="text-red-500 text-sm">
              Please enter a valid email address.
            </p>
          )}
        </div>
      )}

      {mode === "signup" && (
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="h-12"
          />
          {password && password.length < 6 && (
            <p className="text-red-500 text-sm">
              Password must be at least 6 characters long.
            </p>
          )}
          {password && password.length > 0 && password.length < 8 && !isAdmin && (
            <p className="text-yellow-500 text-sm">
              Password strength is weak. Try using a mix of letters and numbers.
            </p>
          )}
          {password && password.length >= 8 && !isAdmin && (
            <p className="text-green-500 text-sm">Password strength is strong.</p>
          )}
        </div>
      )}

      {mode === "login" && (
        <div className="space-y-2">
          <Label htmlFor="mobnumber">Mobile Number</Label>
          <Input
            id="mobnumber"
            type="tel"
            placeholder="e.g. +14155552671"
            value={mobnumber}
            onChange={(e) => setMobnumber(e.target.value)}
            pattern="^\+[1-9]\d{1,14}$"
            required
            className="h-12"
          />
          {mobnumber && !/^\+[1-9]\d{1,14}$/.test(mobnumber) && (
            <p className="text-red-500 text-sm">
              Please enter a valid international mobile number (e.g. +14155552671).
            </p>
          )}
        </div>
      )}

      {mode === "login" && (
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="h-12"
          />
        </div>
      )}

      {mode === "login" && (
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setUseEmailLogin(true)}
            className="w-full h-12 text-white font-medium transition-all duration-300 bg-blue-500 hover:bg-blue-600 rounded-md"
          >
            Login With Email
          </button>
        </div>
      )}

      {mode === "signup" && role !== "admin" && (
        <RadioGroup
          value={selectedRole}
          onValueChange={(value) => setSelectedRole(value as "homeowner" | "provider")}
          className="flex space-x-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="homeowner" id="homeowner" />
            <Label htmlFor="homeowner" className="cursor-pointer">
              Homeowner
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="provider" id="provider" />
            <Label htmlFor="provider" className="cursor-pointer">
              Service Provider
            </Label>
          </div>
        </RadioGroup>
      )}

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <Button
        type="submit"
        className="w-full h-12 text-white font-medium transition-all duration-300 bg-gradient-to-r from-doit-400 to-orange-500 hover:from-doit-500 hover:to-orange-600"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : mode === "login" ? (
          "Login"
        ) : (
          "Sign Up"
        )}
      </Button>
    </form>
  );
};

export default AuthForm;
