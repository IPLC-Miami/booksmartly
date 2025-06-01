import { EyeClosedIcon, EyeOpenIcon } from "@radix-ui/react-icons";
import { Box, Button, Container, TextField } from "@radix-ui/themes";
import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "../utils/supabaseClient";
import useHandleSignUp from "../hooks/useHandleSignUp";

function SignUpPage() {
  const [signupData, setSignupData] = useState({
    id: "",
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    aadhaarNumber: "",
    createdAt: "",
    emailVerified: "",
  });
  const [token, setToken] = useState(
    localStorage.getItem("sb-itbxttkivivyeqnduxjb-auth-token"),
  );

  useEffect(() => {
    if (token) {
      toast.success("Login successful! Redirecting to dashboard....");
      setSuccessMessage("Logging in....");
      setTimeout(() => {
        window.location.href = "/user/dashboard";
      }, 500);
    }
  }, [token]);

  const { mutate, error, success } = useHandleSignUp();
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const handleSignUp = async () => {
    const { email, password, name, phoneNumber } = signupData;
    const signUpData2 = { ...signupData };
    // console.log(signUpData2);
    const frontend_base_url = import.meta.env.VITE_frontend_base_url;

    // Supabase requires only email and password for authentication
    const url = `${frontend_base_url}/login/`;
    // console.log(url);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      phone: phoneNumber,
      options: {
        data: { display_name: name, phone: phoneNumber }, // Store display_name in metadata
        emailRedirectTo: `${frontend_base_url}/login`, // Redirect URL after confirmation
      },
    });

    if (error) {
      // console.log(error);
      setErrorMessage(error.message);
      setSuccessMessage("");
    } else {
      const userId = data?.user?.id; // Get the user ID from auth response
      // console.log("User ID:", userId);
      signUpData2.id = userId;
      // console.log(data?.user);
      // console.log(data?.user?.user_metadata?.email_confirmed_at);

      if (userId != null) {
        const sendUserInfoToBackend = async (signUpData2) => {
          // console.log(signupData);
          mutate.mutate(signUpData2, {
            onSuccess: (data) => {
              // console.log("User info successfully sent to backend:");
              setErrorMessage("");
              setSuccessMessage(
                "Sign-up successful! Please check your email to verify your account.",
              );
              toast.success("Verification Email sent");
              setTimeout(() => {
                navigate("/verification", { state: { email } });
              }, 500);
            },
            onError: (error) => {
              console.log(error);
              setErrorMessage("Email already exists");
              toast.error("Email aready exists.");
            },
          });
        };
        // console.log("Sending user data:", signUpData2);
        sendUserInfoToBackend(signUpData2);
      }
    }
  };

  const [validation, setValidation] = useState({
    email: null,
    aadhaarNumber: null,
    phoneNumber: null,
    password: null,
  });

  const validateField = (name, value) => {
    let isValid = false;

    if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      isValid = emailRegex.test(value);
    } else if (name === "phoneNumber") {
      const phoneRegex = /^[6-9]\d{9}$/;
      isValid = phoneRegex.test(value);
    } else if (name === "aadhaarNumber") {
      const aadhaarRegex = /^\d{12}$/;
      isValid = aadhaarRegex.test(value);
    } else if (name === "password") {
      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      isValid = passwordRegex.test(value);
    } else if (name === "name") {
      // isValid = true;
      return;
    }
    setValidation((prev) => ({ ...prev, [name]: isValid }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    // console.log(name, " ", value);
    validateField(name, value);
  };

  const [typingTimeout, setTypingTimeout] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSignupData((prev) => ({ ...prev, [name]: value }));

    // Clear previous timer
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Set a new timer for 2 seconds for validation
    const newTimeout = setTimeout(() => {
      validateField(name, value);
    }, 500);

    setTypingTimeout(newTimeout);
  };
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    setIsFormValid(Object.values(validation).every(Boolean));
    // console.log(validation);
  }, [validation]);

  return (
    <div className="dotted mt-0 flex min-h-screen flex-col items-center justify-center">
      <div className="relative my-24 flex w-11/12 flex-col gap-y-4 rounded-md border-2 bg-white p-8 font-inter text-sm font-medium text-[#5d5d5d] shadow-2xl shadow-indigo-300 sm:w-8/12 md:w-6/12 lg:w-4/12">
        <div className="absolute left-3 top-3 -z-10 h-full w-full animate-fade-up rounded-md bg-gradient-to-r from-violet-300 to-indigo-400"></div>
        <div className="mb-2 flex select-none text-center font-noto text-base font-semibold md:text-lg">
          Your first appointment is just a sign-up away.
        </div>
        <div className="flex flex-col gap-y-1">
          <span className="">Your Name</span>
          <TextField.Root
            placeholder="Name"
            onChange={handleChange}
            name="name"
            value={signupData.name}
          ></TextField.Root>
        </div>

        <div className="flex flex-col gap-y-1">
          <span className="">Email</span>
          <TextField.Root
            placeholder="Email"
            onChange={handleChange}
            name="email"
            value={signupData.email}
            onBlur={handleBlur}
          ></TextField.Root>
        </div>
        {/* <div> */}
        {validation.email === false && (
          <p className="mt-2 text-red-500">Invalid email format</p>
        )}
        {/* {validation.email === true && (
            <p className="mt-2 text-green-500">Valid email format</p>
          )} */}
        {/* </div> */}

        <div className="flex flex-col gap-y-1">
          <span className="">Aadhaar No.</span>
          <TextField.Root
            placeholder="Aadhaar Number"
            onChange={handleChange}
            name="aadhaarNumber"
            value={signupData.aadhaarNumber}
            onBlur={handleBlur}
          ></TextField.Root>
        </div>
        {/* <div> */}
        {validation.aadhaarNumber === false && (
          <p className="mt-2 text-red-500">Invalid aadhaar format</p>
        )}
        {/* {validation.aadhaar === true && (
            <p className="mt-2 text-green-500">Valid aadhaar format</p>
          )} */}
        {/* </div> */}

        <div className="flex flex-col gap-y-1">
          <span className="">Phone No.</span>
          <TextField.Root
            placeholder="Phone Number"
            onChange={handleChange}
            onBlur={handleBlur}
            name="phoneNumber"
            value={signupData.phoneNumber}
          ></TextField.Root>
        </div>
        {/* <div> */}
        {validation.phoneNumber === false && (
          <p className="mt-2 text-red-500">Invalid Phone Number Format</p>
        )}
        {/* {validation.phone === true && (
            <p className="mt-2 text-green-500">Valid Phone Number Format</p>
          )} */}
        {/* </div> */}

        <div className="flex flex-col gap-y-1">
          <span className="">Password</span>
          <TextField.Root
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            onChange={handleChange}
            value={signupData.password}
            name="password"
          >
            <TextField.Slot className="relative">
              <Button
                variant="soft"
                color="gray"
                style={{
                  left: "0",
                  top: "0",
                  bottom: "0",
                  padding: "0 10px",
                  marginLeft: "-7px",
                  borderRadius: "4px 0 0 4px",
                }}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOpenIcon /> : <EyeClosedIcon />}
              </Button>
            </TextField.Slot>
          </TextField.Root>
        </div>
        {validation.password === false && (
          <p className="text-red-500">
            Password must be at least 8 characters long, include an uppercase
            letter, a lowercase letter, a number, and a special character.
          </p>
        )}
        <Button
          color="iris"
          size="3"
          name="button"
          onClick={handleSignUp}
          disabled={!isFormValid}
        >
          SignUp
        </Button>
        <div>{errorMessage}</div>
        <div>{successMessage}</div>
        <p
          className="w-fit cursor-pointer select-none border-b border-white text-indigo-700 transition-all duration-200 hover:border-b hover:border-indigo-700"
          onClick={() => navigate("/login")}
        >
          Already have an account? Log In
        </p>
      </div>
    </div>
  );
}

export default SignUpPage;
