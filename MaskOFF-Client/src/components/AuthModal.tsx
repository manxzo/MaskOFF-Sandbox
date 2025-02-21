//@ts-nocheck
import { useEffect, useState } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { useUser } from "@/hooks/useUser";
import { useNavigate } from "react-router-dom";
import {
  Modal,
  ModalHeader,
  ModalContent,
  ModalBody,
  ModalFooter,
  Form,
  Tab,
  Tabs,
  Link,
  DateInput,
  ScrollShadow
} from "@heroui/react";
import { parseDate } from "@internationalized/date";

export const AuthModal = ({ onOpen, onOpenChange, isOpen }) => {
  const { login, register, forgotPwd } = useUser();
  const navigate = useNavigate();
  const [selected, setSelected] = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initial form states for each mode.
  const loginForm = { username: "", password: "" };
  const registerForm = {
    name: "",
    dob: null,
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    anonymousIdentity: ""
  };
  const forgetPasswordForm = { email: "" };

  const [form, setForm] = useState(loginForm);

  // Update the form state when mode changes.
  useEffect(() => {
    setError(null);
    switch (selected) {
      case "login":
        setForm(loginForm);
        break;
      case "register":
        setForm(registerForm);
        break;
      case "forgotPassword":
        setForm(forgetPasswordForm);
        break;
      default:
        setForm(loginForm);
    }
  }, [selected]);

  // Generic change handler for text inputs.
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Handler for DateInput change.
  const handleDateChange = (value) => {
    // parseDate returns an object with a toDate() method.
    setForm((prev) => ({
      ...prev,
      dob: value
    }));
  };

  // Handle form submission for all modes.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (selected === "login") {
        await login(form.username, form.password);
      } else if (selected === "register") {
        if (!form.dob) {
          throw new Error("Date of birth is required.");
        }
        const dobDate = form.dob.toDate ? form.dob.toDate() : new Date(form.dob);
        // Validate that dob is a valid date and user is at least 16.
        if (isNaN(dobDate.getTime())) {
          throw new Error("Invalid date format for date of birth.");
        }
        const cutoff = new Date();
        cutoff.setFullYear(cutoff.getFullYear() - 16);
        if (dobDate > cutoff) {
          throw new Error("You must be at least 16 years old to register.");
        }
        await register({
          name: form.name,
          dob: dobDate,
          email: form.email,
          username: form.username,
          password: form.password,
          confirmPassword: form.confirmPassword,
          anonymousIdentity: form.anonymousIdentity
        });
      } else if (selected === "forgotPassword") {
        await forgotPwd(form.email);
      }
      // Close the modal on success.
      onOpenChange(false);
    } catch (err) {
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="4xl">
      <ModalContent>
        {(onClose) => (
          <div className="flex flex-col w-full">
            <ModalHeader>
              {selected === "login" && "Login"}
              {selected === "register" && "Register"}
              {selected === "forgotPassword" && "Reset Password"}
            </ModalHeader>
            <ModalBody>
              {selected !== "forgotPassword" ? (
                <Tabs
                  fullWidth
                  aria-label="Tabs Form"
                  selectedKey={selected}
                  size="md"
                  onSelectionChange={setSelected}
                >
                  <Tab key="login" title="Login">
                    <Form onSubmit={handleSubmit} className="flex flex-col gap-4">
                      <Input
                        isRequired
                        label="Username"
                        placeholder="username"
                        name="username"
                        value={form.username || ""}
                        onChange={handleChange}
                      />
                      <Input
                        isRequired
                        label="Password"
                        placeholder="Enter your password"
                        type="password"
                        name="password"
                        value={form.password || ""}
                        onChange={handleChange}
                      />
                      <p className="text-center text-small">
                        Need to create an account?{" "}
                        <Link size="sm" onPress={() => setSelected("register")}>
                          Register
                        </Link>
                      </p>
                      <p className="text-center text-small">
                        Forgot Password?{" "}
                        <Link size="sm" onPress={() => setSelected("forgotPassword")}>
                          Reset Password
                        </Link>
                      </p>
                      <div className="flex gap-2 justify-end">
                        <Button type="submit" fullWidth color="primary" disabled={loading}>
                          Login
                        </Button>
                      </div>
                    </Form>
                  </Tab>
                  <Tab key="register" title="Register">
                    
                    <Form onSubmit={handleSubmit} className=" overflow-auto" >
                    <ScrollShadow hideScrollBar size={100} className="flex flex-col gap-4 h-[300px] w-full">
                      <Input
                        isRequired
                        label="Name"
                        placeholder="Enter your name"
                        name="name"
                        value={form.name || ""}
                        onChange={handleChange}
                      />
                      <Input
                        isRequired
                        label="Username"
                        placeholder="Username"
                        name="username"
                        value={form.username || ""}
                        onChange={handleChange}
                      />
                      <Input
                        isRequired
                        label="Password"
                        placeholder="Enter your password"
                        type="password"
                        name="password"
                        value={form.password || ""}
                        onChange={handleChange}
                      />
                      <Input
                        isRequired
                        label="Confirm Password"
                        placeholder="Re-Enter your password"
                        type="password"
                        name="confirmPassword"
                        value={form.confirmPassword || ""}
                        onChange={handleChange}
                      />
                      <Input
                        isRequired
                        label="Email"
                        placeholder="Enter your email"
                        type="email"
                        name="email"
                        value={form.email || ""}
                        onChange={handleChange}
                      />
                      <DateInput
                        isRequired
                        label="Date of Birth:"
                        name="dob"
                        value={form.dob || parseDate("2025-02-21")}
                        onChange={handleDateChange}
                      />
                      <Input
                        isRequired
                        label="MaskON Anonymous Identity"
                        placeholder="Anonymous Eagle"
                        name="anonymousIdentity"
                        value={form.anonymousIdentity || ""}
                        onChange={handleChange}
                      />
                      <p className="text-center text-small">
                        Already have an account?{" "}
                        <Link size="sm" onPress={() => setSelected("login")}>
                          Login
                        </Link>
                      </p>
                      <div className="flex gap-2 justify-end">
                        <Button type="submit" fullWidth color="primary" disabled={loading}>
                          Sign up
                        </Button>
                      </div>
                      </ScrollShadow>
                    </Form>
                    
                    
                  </Tab>
                </Tabs>
              ) : (
                <Form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <Input
                    isRequired
                    label="Email"
                    placeholder="Enter your Email"
                    type="email"
                    name="email"
                    value={form.email || ""}
                    onChange={handleChange}
                  />
                  <div className="flex gap-2 justify-end">
                    <Button type="submit" fullWidth color="primary" disabled={loading}>
                      Send Reset Email
                    </Button>
                  </div>
                  <p className="text-center text-small">
                    Ready to Login?{" "}
                    <Link size="sm" onPress={() => setSelected("login")}>
                      Login
                    </Link>
                  </p>
                </Form>
              )}
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </ModalBody>
          </div>
        )}
      </ModalContent>
    </Modal>
  );
};
