const API_URL = import.meta.env.VITE_API_URL;

interface ForgotPasswordResponse {
  message: string;
}

interface ResetPasswordResponse {
  message: string;
}

export const passwordService = {
  async forgotPassword(email: string): Promise<ForgotPasswordResponse> {
    const response = await fetch(`${API_URL}/password/forgot`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Une erreur est survenue");
    }

    return response.json();
  },

  async resetPassword(
    token: string,
    password: string
  ): Promise<ResetPasswordResponse> {
    const response = await fetch(`${API_URL}/password/reset`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, password }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        error.message || "Token invalide ou mot de passe trop court"
      );
    }

    return response.json();
  },
};

export default passwordService;
