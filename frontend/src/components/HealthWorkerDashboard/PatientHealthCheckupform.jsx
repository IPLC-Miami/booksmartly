import React, { useState, useEffect } from "react";
import {
  MapPin,
  Phone,
  Calendar,
  User,
  Heart,
  FileText,
  Plus,
  AlertCircle,
} from "lucide-react";

const PatientHealthStatusForm = () => {
  const api = import.meta.env.VITE_API_BASE_URL;

  const [activeStep, setActiveStep] = useState(1);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({
    health_worker_id: "",
    patientName: "",
    patientAge: "",
    patientGender: "",
    patientContact: "",
    address: "",
    complaints: "",
    symptoms: "",
    bodyTemperature: "",
    bloodPressure: "",
    pulseRate: "",
    oxygenLevel: "",
    height: "",
    weight: "",
    allergies: "",
    existingConditions: "",
    medications: "",
    additionalNotes: "",
    dateOfBirth: "",
    email: "",
    emergencyContact: "",
    relationToPatient: "",
  });

  const [token, setToken] = useState(
    localStorage.getItem("sb-itbxttkivivyeqnduxjb-auth-token"),
  );
  const data = JSON.parse(token);

  const [healthWorkerId, setHealthWorkerId] = useState(data?.user?.id);
  useEffect(() => {
    setFormData((prevData) => ({
      ...prevData,
      health_worker_id: healthWorkerId,
    }));
  }, [healthWorkerId]); // Runs when healthWorkerID changes

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Perform field-specific validation
    const errorMessage = validateField(name, value);

    // Update errors state
    if (errorMessage) {
      setFormErrors({
        ...formErrors,
        [name]: errorMessage,
      });
    } else if (formErrors[name]) {
      // Clear error for this field when user fixes it
      const updatedErrors = { ...formErrors };
      delete updatedErrors[name];
      setFormErrors(updatedErrors);
    }
  };

  const validateAllSteps = () => {
    const newErrors = {};
    let isValid = true;

    // Check required fields from all steps
    for (let step = 1; step <= 4; step++) {
      const requiredForStep = requiredFields[step];
      for (let field of requiredForStep) {
        if (!formData[field] || formData[field].trim() === "") {
          newErrors[field] = "This field is required";
          isValid = false;
        } else {
          const errorMessage = validateField(field, formData[field]);
          if (errorMessage) {
            newErrors[field] = errorMessage;
            isValid = false;
          }
        }
      }
    }

    // Validate optional fields
    const optionalFieldsToValidate = ["email", "emergencyContact"];
    for (let field of optionalFieldsToValidate) {
      if (formData[field]) {
        const errorMessage = validateField(field, formData[field]);
        if (errorMessage) {
          newErrors[field] = errorMessage;
          isValid = false;
        }
      }
    }

    setFormErrors(newErrors);
    return isValid;
  };
  // Make sure your handleSubmit function also validates all steps
  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = validateAllSteps(); // This updates formErrors state

    if (isValid) {
      console.log("Form submitted:", formData);
      alert("Form submitted successfully!");
    } else {
      alert("Please fix all errors before submitting.");

      // Find first error step after state update
      setTimeout(() => {
        for (let step = 1; step <= 4; step++) {
          const requiredForStep = requiredFields[step];
          if (requiredForStep.some((field) => formErrors[field])) {
            setActiveStep(step);
            break;
          }
        }
      }, 0);
    }
    try {
      const response = await fetch(
        `${api}/api/healthWorkerRoutes/healthcheckups`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        },
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Success:", data);
      } else {
        console.error("Error submitting form:", response.statusText);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Required fields for each step
  const requiredFields = {
    1: [
      "patientName",
      "patientAge",
      "patientGender",
      "patientContact",
      "address",
      "dateOfBirth",
    ],
    2: ["complaints"],
    3: [], // No required fields in step 3
    4: [], // No required fields in step 4
  };

  // Validate the current step
  const validateStep = (stepNumber) => {
    const requiredForStep = requiredFields[stepNumber];
    const newErrors = { ...formErrors }; // Start with existing errors
    let isValid = true;

    requiredForStep.forEach((field) => {
      if (!formData[field].trim()) {
        newErrors[field] = "This field is required";
        isValid = false;
      } else {
        // Also check regex validation for filled fields
        const errorMessage = validateField(field, formData[field]);
        if (errorMessage) {
          newErrors[field] = errorMessage;
          isValid = false;
        } else {
          // Clear any previous errors for this field
          delete newErrors[field];
        }
      }
    });

    // Also validate email and phone fields if they have values
    ["email", "emergencyContact"].forEach((field) => {
      if (formData[field] && !requiredForStep.includes(field)) {
        const errorMessage = validateField(field, formData[field]);
        if (errorMessage) {
          newErrors[field] = errorMessage;
          isValid = false;
        } else {
          delete newErrors[field];
        }
      }
    });

    setFormErrors(newErrors);
    return isValid;
  };

  const fetchAddressSuggestions = async (query) => {
    if (!query || query.length < 3) {
      setAddressSuggestions([]);
      return;
    }

    setIsLoadingSuggestions(true);
    try {
      // Using Google Maps Geocoding API
      const apiKey =import.meta.env.VITE_APP_GOOGLE_MAPS_API_KEY || "YOUR_API_KEY";
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${apiKey}`,
      );

      if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.status !== "OK" && data.results?.length > 0) {
        setAddressSuggestions([]);
        return;
      }

      // Transform Google's response format
      const suggestions = data.results.map((item) => {
        const getComponent = (type, short = false) => {
          const component = item.address_components?.find((comp) =>
            comp.types.includes(type),
          );
          return component
            ? short
              ? component.short_name
              : component.long_name
            : "";
        };

        return {
          fullAddress: item.formatted_address,
          city: getComponent("locality"),
          state: getComponent("administrative_area_level_1"),
          pincode: getComponent("postal_code"),
          latitude: item.geometry?.location?.lat,
          longitude: item.geometry?.location?.lng,
        };
      });

      setAddressSuggestions(suggestions.slice(0, 5));
    } catch (error) {
      console.error("Error fetching address suggestions:", error);
      setAddressSuggestions([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const selectAddress = (address) => {
    setFormData({
      ...formData,
      address: address.fullAddress,
    });
    setAddressSuggestions([]);

    // Clear error for address field if it exists
    if (formErrors.address) {
      setFormErrors({
        ...formErrors,
        address: "",
      });
    }
  };

  const nextStep = (e) => {
    e.preventDefault();

    if (validateStep(activeStep)) {
      setActiveStep((prev) => Math.min(prev + 1, 4));
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    setActiveStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  };

  // Calculate BMI when height and weight are both entered
  useEffect(() => {
    if (formData.height && formData.weight) {
      const heightInMeters = parseInt(formData.height) / 100;
      const weightInKg = parseInt(formData.weight);
      if (heightInMeters > 0 && weightInKg > 0) {
        const bmi = (weightInKg / (heightInMeters * heightInMeters)).toFixed(1);
        // We're just calculating it here, not storing it
        console.log("BMI:", bmi);
      }
    }
  }, [formData.height, formData.weight]);

  // Add these validation functions to your component
  const validateField = (name, value) => {
    // Email validation
    if (name === "email" && value) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(value)) {
        return "Please enter a valid email address";
      }
    }

    // Contact number validation (primary contact)
    if (name === "patientContact" && value) {
      // Accept formats like: +1 (555) 123-4567, 555-123-4567, 5551234567
      const contactRegex =
        /^(\+\d{1,3}\s?)?(\(\d{3}\)\s?|\d{3}[-\s]?)?\d{3}[-\s]?\d{4}$/;
      if (!contactRegex.test(value)) {
        return "Please enter a valid contact number (e.g., +1 (555) 123-4567)";
      }
    }

    // Emergency contact validation
    if (name === "emergencyContact" && value) {
      const phoneRegex =
        /^(\+\d{1,3}\s?)?(\(\d{3}\)\s?|\d{3}[-\s]?)?\d{3}[-\s]?\d{4}$/;
      if (!phoneRegex.test(value)) {
        return "Please enter a valid emergency contact number";
      }
    }

    return "";
  };

  // Update form errors

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto w-full max-w-4xl px-4">
        {/* Form Title */}
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800">
            Patient Health Assessment
          </h2>
          <p className="mt-2 text-gray-600">
            Complete this form for health checkup
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className="flex flex-col items-center"
                onClick={() => setActiveStep(step)}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full font-medium ${
                    activeStep >= step
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {step}
                </div>
                <span
                  className={`mt-2 text-xs ${
                    activeStep >= step ? "text-blue-600" : "text-gray-500"
                  }`}
                >
                  {step === 1
                    ? "Personal Info"
                    : step === 2
                      ? "Symptoms"
                      : step === 3
                        ? "Vital Signs"
                        : "Medical History"}
                </span>
              </div>
            ))}
          </div>
          <div className="relative mt-2">
            <div className="absolute h-1 w-full bg-gray-200"></div>
            <div
              className="absolute h-1 bg-blue-600 transition-all duration-300"
              style={{ width: `${(activeStep - 1) * 33.33}%` }}
            ></div>
          </div>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit}>
          <div className="overflow-hidden rounded-xl bg-white shadow-lg">
            {/* Step 1: Personal Information */}
            {activeStep === 1 && (
              <div className="animate-fade-in">
                <div className="flex items-center border-b bg-gradient-to-r from-blue-50 to-blue-100 p-6">
                  <User className="mr-3 text-blue-600" />
                  <h3 className="text-xl font-semibold text-gray-800">
                    Personal Information
                  </h3>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <label
                        htmlFor="patientName"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Full Name*
                      </label>
                      <input
                        type="text"
                        id="patientName"
                        name="patientName"
                        required
                        value={formData.patientName}
                        onChange={handleChange}
                        className={`mt-1 w-full rounded-md border ${formErrors.patientName ? "border-red-500" : "border-gray-300"} px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500`}
                        placeholder="John Doe"
                      />
                      {formErrors.patientName && (
                        <p className="mt-1 text-xs text-red-500">
                          {formErrors.patientName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="dateOfBirth"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Date of Birth*
                      </label>
                      <input
                        type="date"
                        id="dateOfBirth"
                        name="dateOfBirth"
                        required
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        className={`mt-1 w-full rounded-md border ${formErrors.dateOfBirth ? "border-red-500" : "border-gray-300"} px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500`}
                      />
                      {formErrors.dateOfBirth && (
                        <p className="mt-1 text-xs text-red-500">
                          {formErrors.dateOfBirth}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="patientAge"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Age*
                      </label>
                      <input
                        type="number"
                        id="patientAge"
                        name="patientAge"
                        required
                        value={formData.patientAge}
                        onChange={handleChange}
                        className={`mt-1 w-full rounded-md border ${formErrors.patientAge ? "border-red-500" : "border-gray-300"} px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500`}
                        placeholder="25"
                      />
                      {formErrors.patientAge && (
                        <p className="mt-1 text-xs text-red-500">
                          {formErrors.patientAge}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="patientGender"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Gender*
                      </label>
                      <select
                        id="patientGender"
                        name="patientGender"
                        required
                        value={formData.patientGender}
                        onChange={handleChange}
                        className={`mt-1 w-full rounded-md border ${formErrors.patientGender ? "border-red-500" : "border-gray-300"} px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500`}
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                      {formErrors.patientGender && (
                        <p className="mt-1 text-xs text-red-500">
                          {formErrors.patientGender}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="patientContact"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Contact Number*
                      </label>
                      <div className="relative mt-1">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <Phone className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="tel"
                          id="patientContact"
                          name="patientContact"
                          required
                          value={formData.patientContact}
                          onChange={handleChange}
                          className={`w-full rounded-md border ${formErrors.patientContact ? "border-red-500" : "border-gray-300"} py-2 pl-10 pr-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500`}
                          placeholder="+1 (555) 123-4567"
                        />
                        {formErrors.patientContact && (
                          <p className="mt-1 text-xs text-red-500">
                            {formErrors.patientContact}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                        placeholder="johndoe@example.com"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label
                        htmlFor="address"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Address*
                      </label>
                      <div className="relative mt-1">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <MapPin className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="address"
                          name="address"
                          required
                          value={formData.address}
                          onChange={(e) => {
                            handleChange(e);
                            fetchAddressSuggestions(e.target.value);
                          }}
                          className={`w-full rounded-md border ${formErrors.address ? "border-red-500" : "border-gray-300"} py-2 pl-10 pr-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500`}
                          placeholder="Enter your address"
                        />
                        {formErrors.address && (
                          <p className="mt-1 text-xs text-red-500">
                            {formErrors.address}
                          </p>
                        )}

                        {/* Address Suggestions Dropdown */}
                        {addressSuggestions.length > 0 && (
                          <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
                            {addressSuggestions.map((address, index) => (
                              <div
                                key={index}
                                className="cursor-pointer border-b border-gray-100 px-4 py-2 text-sm hover:bg-blue-50"
                                onClick={() => selectAddress(address)}
                              >
                                {address.fullAddress}
                              </div>
                            ))}
                          </div>
                        )}

                        {isLoadingSuggestions && (
                          <div className="absolute right-3 top-2">
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="emergencyContact"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Emergency Contact
                      </label>
                      <input
                        type="tel"
                        id="emergencyContact"
                        name="emergencyContact"
                        value={formData.emergencyContact}
                        onChange={handleChange}
                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                        placeholder="Emergency contact number"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="relationToPatient"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Relation to Patient
                      </label>
                      <input
                        type="text"
                        id="relationToPatient"
                        name="relationToPatient"
                        value={formData.relationToPatient}
                        onChange={handleChange}
                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                        placeholder="e.g. Spouse, Parent, etc."
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Health Complaints and Symptoms */}
            {activeStep === 2 && (
              <div className="animate-fade-in">
                <div className="flex items-center border-b bg-gradient-to-r from-blue-50 to-blue-100 p-6">
                  <AlertCircle className="mr-3 text-blue-600" />
                  <h3 className="text-xl font-semibold text-gray-800">
                    Health Complaints & Symptoms
                  </h3>
                </div>

                <div className="p-6">
                  <div className="mb-6">
                    <label
                      htmlFor="complaints"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Primary Complaints*
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="complaints"
                        name="complaints"
                        required
                        value={formData.complaints}
                        onChange={handleChange}
                        rows="3"
                        className={`w-full rounded-md border ${formErrors.complaints ? "border-red-500" : "border-gray-300"} px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500`}
                        placeholder="Describe your main health concerns in detail"
                      ></textarea>
                      {formErrors.complaints && (
                        <p className="mt-1 text-xs text-red-500">
                          {formErrors.complaints}
                        </p>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Include when symptoms started and any factors that make
                      them better or worse
                    </p>
                  </div>

                  <div className="mb-6">
                    <label
                      htmlFor="symptoms"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Symptoms
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="symptoms"
                        name="symptoms"
                        value={formData.symptoms}
                        onChange={handleChange}
                        rows="3"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                        placeholder="List all symptoms you're experiencing (e.g., fever, headache, fatigue)"
                      ></textarea>
                    </div>
                  </div>

                  <div className="rounded-md bg-blue-50 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <Heart className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">
                          Important Note
                        </h3>
                        <div className="mt-2 text-sm text-blue-700">
                          <p>
                            If you're experiencing severe symptoms like chest
                            pain, difficulty breathing, or any medical
                            emergency, please call emergency services
                            immediately.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Vital Signs */}
            {activeStep === 3 && (
              <div className="animate-fade-in">
                <div className="flex items-center border-b bg-gradient-to-r from-blue-50 to-blue-100 p-6">
                  <Plus className="mr-3 text-blue-600" />
                  <h3 className="text-xl font-semibold text-gray-800">
                    Vital Signs
                  </h3>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div>
                      <label
                        htmlFor="bodyTemperature"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Body Temperature (°F)
                      </label>
                      <input
                        type="text"
                        id="bodyTemperature"
                        name="bodyTemperature"
                        value={formData.bodyTemperature}
                        onChange={handleChange}
                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                        placeholder="98.6"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Normal range: 97.8°F - 99.1°F
                      </p>
                    </div>

                    <div>
                      <label
                        htmlFor="bloodPressure"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Blood Pressure (mmHg)
                      </label>
                      <input
                        type="text"
                        id="bloodPressure"
                        name="bloodPressure"
                        value={formData.bloodPressure}
                        onChange={handleChange}
                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                        placeholder="120/80"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Format: Systolic/Diastolic
                      </p>
                    </div>

                    <div>
                      <label
                        htmlFor="pulseRate"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Pulse Rate (bpm)
                      </label>
                      <input
                        type="text"
                        id="pulseRate"
                        name="pulseRate"
                        value={formData.pulseRate}
                        onChange={handleChange}
                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                        placeholder="72"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Normal range: 60-100 bpm
                      </p>
                    </div>

                    <div>
                      <label
                        htmlFor="oxygenLevel"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Oxygen Level (SpO2%)
                      </label>
                      <input
                        type="text"
                        id="oxygenLevel"
                        name="oxygenLevel"
                        value={formData.oxygenLevel}
                        onChange={handleChange}
                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                        placeholder="98"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Normal range: 95%-100%
                      </p>
                    </div>

                    <div>
                      <label
                        htmlFor="height"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Height (cm)
                      </label>
                      <input
                        type="text"
                        id="height"
                        name="height"
                        value={formData.height}
                        onChange={handleChange}
                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                        placeholder="175"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="weight"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Weight (kg)
                      </label>
                      <input
                        type="text"
                        id="weight"
                        name="weight"
                        value={formData.weight}
                        onChange={handleChange}
                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                        placeholder="70"
                      />
                    </div>
                  </div>

                  {formData.height && formData.weight && (
                    <div className="mt-6 rounded-md bg-blue-50 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-blue-800">
                            BMI Calculation
                          </h3>
                          <div className="mt-2 text-sm text-blue-700">
                            <p>
                              Based on your height and weight, your BMI is
                              approximately{" "}
                              {(
                                parseInt(formData.weight) /
                                Math.pow(parseInt(formData.height) / 100, 2)
                              ).toFixed(1)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Medical History */}
            {activeStep === 4 && (
              <div className="animate-fade-in">
                <div className="flex items-center border-b bg-gradient-to-r from-blue-50 to-blue-100 p-6">
                  <FileText className="mr-3 text-blue-600" />
                  <h3 className="text-xl font-semibold text-gray-800">
                    Medical History
                  </h3>
                </div>

                <div className="p-6">
                  <div className="mb-6">
                    <label
                      htmlFor="allergies"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Known Allergies
                    </label>
                    <textarea
                      id="allergies"
                      name="allergies"
                      value={formData.allergies}
                      onChange={handleChange}
                      rows="2"
                      className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                      placeholder="List any allergies to medications, foods, or environmental factors"
                    ></textarea>
                  </div>

                  <div className="mb-6">
                    <label
                      htmlFor="existingConditions"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Existing Medical Conditions
                    </label>
                    <textarea
                      id="existingConditions"
                      name="existingConditions"
                      value={formData.existingConditions}
                      onChange={handleChange}
                      rows="2"
                      className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                      placeholder="List any chronic diseases or conditions you've been diagnosed with"
                    ></textarea>
                  </div>

                  <div className="mb-6">
                    <label
                      htmlFor="medications"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Current Medications
                    </label>
                    <textarea
                      id="medications"
                      name="medications"
                      value={formData.medications}
                      onChange={handleChange}
                      rows="2"
                      className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                      placeholder="List all current medications with dosage information"
                    ></textarea>
                  </div>

                  <div>
                    <label
                      htmlFor="additionalNotes"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Additional Medical Notes
                    </label>
                    <textarea
                      id="additionalNotes"
                      name="additionalNotes"
                      value={formData.additionalNotes}
                      onChange={handleChange}
                      rows="3"
                      className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                      placeholder="Any other relevant medical information or history"
                    ></textarea>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="border-t bg-gray-50 p-6">
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={prevStep}
                  className={`rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 ${
                    activeStep === 1 ? "invisible" : ""
                  }`}
                >
                  Previous
                </button>
                <div>
                  {activeStep < 4 ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="ml-3 rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className={`ml-3 rounded-md border border-transparent px-4 py-2 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        Object.keys(formErrors).length > 0
                          ? "cursor-not-allowed bg-gray-400 text-gray-700"
                          : "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500"
                      }`}
                      disabled={Object.keys(formErrors).length > 0}
                    >
                      Submit
                    </button>
                  )}
                </div>
              </div>
              {Object.keys(formErrors).length > 0 && (
                <div className="mt-4 rounded-md bg-red-50 p-3">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        Please correct the following errors:
                      </h3>
                      <div className="mt-2 text-sm text-red-700">
                        <ul className="list-disc space-y-1 pl-5">
                          {Object.keys(formErrors).map((field) => (
                            <li key={field}>
                              {field
                                .replace(/([A-Z])/g, " $1")
                                .replace(/^./, (str) => str.toUpperCase())}
                              : {formErrors[field]}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-8 flex justify-center">
          <span className="text-sm text-gray-500">
            © {new Date().getFullYear()} BookSmartly Health. All rights reserved.
          </span>
        </div>
      </div>
    </div>
  );
};

export default PatientHealthStatusForm;

