import * as React from "react";
import { APIBaseUrl } from "../constants";
import { jwtDecode } from "jwt-decode";
import { Relations, Roles } from "../types";

type AuthContextType = {
  role: Roles | undefined;
  login: (username: string, password: string) => Promise<Roles | undefined>;
  logout: () => Promise<void>;
  accessToken: string | undefined;
  subject: string | undefined;
  relation: Relations | undefined;
};
type AuthProviderProps = {
  children: React.ReactNode;
};

export const AuthContext = React.createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [role, setRole] = React.useState<Roles>();
  const [expiresAt, setExpiresAt] = React.useState<number>();
  const [token, setToken] = React.useState<string>();
  const [subject, setSubject] = React.useState<string>();
  const [relation, setRelation] = React.useState<Relations>();

  React.useEffect(() => {
    const role = localStorage.getItem("role");
    const expiresAt = localStorage.getItem("expiresAt");
    const token = localStorage.getItem("token");
    const subject = localStorage.getItem("subject");
    const relation = localStorage.getItem("relation");

    if (
      role?.trim() &&
      expiresAt?.trim() &&
      token?.trim() &&
      subject?.trim() &&
      relation?.trim()
    ) {
      console.log("here");
      if (Number(expiresAt) > Date.now()) {
        console.log("there");
        setToken(token);
        setExpiresAt(Number(expiresAt));
        setSubject(subject);
        setRole(role as Roles);
        setRelation(JSON.parse(relation));
      } else {
        localStorage.clear();
      }
    } else {
      localStorage.clear();
    }
  }, []);

  React.useEffect(() => {
    const listener = window.addEventListener("beforeunload", () => {
      localStorage.setItem("role", role ?? "");
      localStorage.setItem("expiresAt", expiresAt ? expiresAt.toString() : "");
      localStorage.setItem("token", token ?? "");
      localStorage.setItem("subject", subject ?? "");
      localStorage.setItem("relation", JSON.stringify(relation ?? ""));
    });
    return listener;
  }, [role, expiresAt, token, subject]);

  React.useEffect(() => {
    let timeout: NodeJS.Timeout | undefined;
    if (expiresAt) {
      timeout = setTimeout(refreshToken, expiresAt - Date.now() - 15000);
    }
    return () => clearTimeout(timeout);
  }, [expiresAt]);

  const refreshToken = async () => {
    const response = await fetch(`${APIBaseUrl}/refreshToken`);
    if (!response || response.status !== 200) {
      console.log("refresh failed");
      return;
    } else {
      const json = await response.json();
      const decoded = parsePayload(json.accessToken);
      if (decoded) setExpiresAt(decoded.exp! * 1000);
    }
  };

  const parsePayload = (token: string) => {
    try {
      return jwtDecode(token);
    } catch {
      return undefined;
    }
  };

  const login = async (
    username: string,
    password: string
  ): Promise<undefined | Roles> => {
    const response = await fetch(
      `${APIBaseUrl}/accessToken/${encodeURIComponent(
        username
      )}/${encodeURIComponent(password)}`,
      { method: "POST" }
    );
    if (response.status !== 200) {
      return;
    } else {
      const json = await response.json();
      setToken(json.accessToken);
      const decoded = parsePayload(json.accessToken);
      //@ts-ignore
      if (!decoded?.aud || !decoded.exp || !decoded.relations) return;
      //@ts-ignore
      setRelation(decoded.relations);
      setRole(decoded.aud as Roles);
      setExpiresAt(decoded.exp * 1000);
      setSubject(decoded.sub);
      return decoded.aud as Roles;
    }
  };

  const logout = async () => {
    await fetch(`${APIBaseUrl}/logout`);
    setRole(undefined);
    setExpiresAt(undefined);
  };

  return (
    <AuthContext.Provider
      value={{ role, login, logout, accessToken: token, subject, relation }}
    >
      {children}
    </AuthContext.Provider>
  );
};
export { Roles };
