// src/pages/Login.jsx
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useFont } from "../context/FontContext";
import { useNavigate } from "react-router-dom";
import userAPI from "../apis/authAPI";
import { toast } from "sonner";

const Login = () => {
    const [credentials, setCredentials] = useState({
        email: "",
        password: "",
    });
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { setLoginData } = useAuth(); // Changed from login to setLoginData
    const { themeColors } = useTheme();
    const { currentFont } = useFont();
    const navigate = useNavigate(); // Added navigate hook

    const handleChange = (e) => {
        setCredentials({
            ...credentials,
            [e.target.name]: e.target.value,
        });
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const response = await userAPI.login({email:credentials.email,password:credentials.password});
            console.log("API Response:", response.data); // Debug log
            
            if (response.data && response.data.token) {
                const { token, employee } = response.data;
                // if(employee.role === "HR_Manager"){
                //     toast.warning("HR_Manager only can login from here")
                //     return
                // }
                // Format user data according to API response
                const userData = {
                    _id: employee._id,
                    id: employee._id,
                    employeeId: employee.employeeId,
                    name: `${employee.name.first} ${employee.name.last}`,
                    email: employee.email,
                    role: employee.role,
                    mobile: employee.mobile,
                    salary: employee.salary,
                    department: employee.department,
                    designation: employee.designation,
                    isActive: employee.isActive
                };
                
                // Set login data in context
                setLoginData(userData, token);
                
                console.log("Login successful, navigating to dashboard");
                navigate("/dashboard", { replace: true }); // Redirect to dashboard after login
            } else {
                setError(response.data?.message || "Login failed");
            }
        } catch (err) {
            console.error("Login error:", err);
            setError(err.response?.data?.message || "An error occurred during login");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4"
            style={{
                backgroundColor: themeColors.background,
                fontFamily: currentFont.family || 'var(--app-font, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)'
            }}
        >
            <div
                className="w-full max-w-md p-8 rounded-lg shadow-xl"
                style={{
                    backgroundColor: themeColors.surface,
                    border: `1px solid ${themeColors.border}`,
                }}
            >
                <div className="text-center mb-8">
                    <h1
                        className="text-3xl font-bold mb-2"
                        style={{ color: themeColors.primary }}
                    >
                        HRMS Portal
                    </h1>
                    <p style={{ color: themeColors.text }}>Sign in to your account</p>
                </div>

                {error && (
                    <div
                        className="mb-4 p-3 rounded-md text-center"
                        style={{
                            backgroundColor: themeColors.danger + "20",
                            color: themeColors.danger,
                            border: `1px solid ${themeColors.danger}`,
                        }}
                    >
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label
                            htmlFor="email"
                            className="block mb-2 font-medium"
                            style={{ color: themeColors.text }}
                        >
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={credentials.email}
                            onChange={handleChange}
                            required
                            className="w-full p-3 rounded-md border focus:outline-none focus:ring-2"
                            style={{
                                backgroundColor: themeColors.background,
                                color: themeColors.text,
                                borderColor: themeColors.border,
                                focusBorderColor: themeColors.primary,
                                focusRingColor: themeColors.primary + "40",
                            }}
                            placeholder="Enter your email"
                            disabled={isLoading}
                        />
                    </div>

                    <div className="mb-6">
                        <label
                            htmlFor="password"
                            className="block mb-2 font-medium"
                            style={{ color: themeColors.text }}
                        >
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={credentials.password}
                            onChange={handleChange}
                            required
                            className="w-full p-3 rounded-md border focus:outline-none focus:ring-2"
                            style={{
                                backgroundColor: themeColors.background,
                                color: themeColors.text,
                                borderColor: themeColors.border,
                                focusBorderColor: themeColors.primary,
                                focusRingColor: themeColors.primary + "40",
                            }}
                            placeholder="Enter your password"
                            disabled={isLoading}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 px-4 rounded-md font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                            backgroundColor: themeColors.primary,
                            color: "#ffffff",
                        }}
                        onMouseEnter={(e) => {
                            if (!isLoading) {
                                e.target.style.backgroundColor = themeColors.primary + "E6";
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isLoading) {
                                e.target.style.backgroundColor = themeColors.primary;
                            }
                        }}
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Signing in...
                            </span>
                        ) : (
                            "Sign In"
                        )}
                    </button>
                </form>

            </div>
        </div>
    );
};

export default Login;