import React, { useState, useEffect } from "react";

function HealthCampRegistrationForm() {
  const api = import.meta.env.VITE_API_BASE_URL;

  const [formData, setFormData] = useState({
    campName: "",
    organizerName: "",
    organizationType: "",
    contactPerson: "",
    contactPhone: "",
    contactEmail: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    expectedAttendees: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    latitude: "",
    longitude: "",
    campReason: "",
    medicalServices: [],
    campImages: null,
    policePermission: null,
    localAuthPermission: null,
    otherDocuments: null,
    additionalNotes: "",
  });

  // For address suggestions
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  // For multiple checkbox selections
  const medicalServiceOptions = [
    "General Health Check-up",
    "Eye Check-up",
    "Dental Care",
    "Vaccinations",
    "Blood Donation",
    "Women's Health",
    "Child Health",
    "Diabetes Screening",
    "Blood Pressure Monitoring",
    "Nutritional Counseling",
  ];

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "checkbox") {
      // Handle checkboxes for medical services
      if (checked) {
        setFormData({
          ...formData,
          medicalServices: [...formData.medicalServices, value],
        });
      } else {
        setFormData({
          ...formData,
          medicalServices: formData.medicalServices.filter(
            (service) => service !== value,
          ),
        });
      }
    } else if (type === "file") {
      // Handle file uploads
      setFormData({ ...formData, [name]: files[0] });
    } else {
      // Handle regular form inputs
      setFormData({ ...formData, [name]: value });
    }
  };

  // Function to fetch address suggestions based on user input
  const fetchAddressSuggestions = async (query) => {
    if (!query || query.length < 3) {
      setAddressSuggestions([]);
      return;
    }

    setIsLoadingSuggestions(true);
    try {
      // Using Google Maps Geocoding API
      const apiKey = import.meta.env.VITE_APP_GOOGLE_MAPS_API_KEY;
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${apiKey}&sensor=true`,
      );

      if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.status !== "OK") {
        throw new Error(`Geocoding error: ${data.status}`);
      }

      // Transform Google's response format into our desired structure
      const suggestions = data.results.map((item) => {
        // Extract address components
        const getComponent = (type, short = false) => {
          const component = item.address_components.find((comp) =>
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
          latitude: item.geometry.location.lat,
          longitude: item.geometry.location.lng,
          placeId: item.place_id, // Useful for later operations with Google Places API
        };
      });

      setAddressSuggestions(suggestions.slice(0, 5)); // Limit to 5 results
    } catch (error) {
      console.error("Error fetching address suggestions:", error);
      setAddressSuggestions([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  // Function to handle address input changes with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formData.address) {
        fetchAddressSuggestions(formData.address);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.address]);

  // Function to handle selection of an address from dropdown
  const handleAddressSelect = (suggestion) => {
    setFormData({
      ...formData,
      address: suggestion.fullAddress,
      city: suggestion.city,
      state: suggestion.state,
      pincode: suggestion.pincode,
      latitude: suggestion.latitude,
      longitude: suggestion.longitude,
    });
    setAddressSuggestions([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    // Append text fields
    data.append("campName", formData.campName);
    data.append("organizerName", formData.organizerName);
    data.append("organizationType", formData.organizationType);
    data.append("contactPerson", formData.contactPerson);
    data.append("contactPhone", formData.contactPhone);
    data.append("contactEmail", formData.contactEmail);
    data.append("startDate", formData.startDate);
    data.append("endDate", formData.endDate);
    data.append("startTime", formData.startTime);
    data.append("endTime", formData.endTime);
    data.append("expectedAttendees", formData.expectedAttendees);
    data.append("address", formData.address);
    data.append("city", formData.city);
    data.append("state", formData.state);
    data.append("pincode", formData.pincode);
    data.append("latitude", formData.latitude);
    data.append("longitude", formData.longitude);
    data.append("campReason", formData.campReason);
    data.append("additionalNotes", formData.additionalNotes);
    // Append array as a JSON string (if needed)
    data.append("medicalServices", JSON.stringify(formData.medicalServices));
    // Append file fields if they exist
    if (formData.campImages) {
      data.append("campImages", formData.campImages);
    }
    if (formData.policePermission) {
      data.append("policePermission", formData.policePermission);
    }
    if (formData.localAuthPermission) {
      data.append("localAuthPermission", formData.localAuthPermission);
    }
    if (formData.otherDocuments) {
      data.append("otherDocuments", formData.otherDocuments);
    }

    try {
      console.log(data);
      const response = await fetch(
        `${api}/api/healthWorkerRoutes/healthCampRegistration`,
        {
          method: "POST",
          body: data,
          // Let the browser set the Content-Type header including the boundary for multipart/form-data
        },
      );
      console.log(response);
      const result = await response.json();
      console.log("Success:", result);
      alert("Form Submitted");
    } catch (err) {
      console.error("Error:", err);
      alert("Some error occured");
    }

    // Here you would handle the API call to your backend with FormData for file uploads
    console.log("Form submitted:", formData);
    // Reset form or show success message
  };

  return (
    <div className="min-h-screen animate-fade-up bg-slate-50 pb-8">
      {/* Form Title */}
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-center font-noto text-2xl font-bold text-gray-800 md:text-3xl">
          Health Camp Registration Form
        </h1>
        <p className="mt-2 text-center font-noto text-gray-600">
          Complete the form below to register your health camp with BookSmartly
        </p>
      </div>

      {/* Main Form */}
      <div className="container mx-auto max-w-4xl px-4">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-y-8 rounded-xl bg-white p-6 font-noto shadow-lg"
        >
          {/* Camp Basic Information */}
          <div className="border-b border-gray-200 pb-6">
            <div className="mb-4 flex items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="ml-2 text-lg font-semibold text-blue-700">
                Health Camp Information
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
              <div>
                <label
                  htmlFor="campName"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Camp Name*
                </label>
                <input
                  type="text"
                  id="campName"
                  name="campName"
                  required
                  value={formData.campName}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. Free Eye Check-up Camp"
                />
              </div>
              <div>
                <label
                  htmlFor="organizerName"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Organizer/NGO Name*
                </label>
                <input
                  type="text"
                  id="organizerName"
                  name="organizerName"
                  required
                  value={formData.organizerName}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter organizer name"
                />
              </div>
              <div>
                <label
                  htmlFor="organizationType"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Organization Type*
                </label>
                <select
                  id="organizationType"
                  name="organizationType"
                  required
                  value={formData.organizationType}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Select Type</option>
                  <option value="ngo">NGO</option>
                  <option value="government">Government</option>
                  <option value="hospital">Hospital/Clinic</option>
                  <option value="corporate">Corporate</option>
                  <option value="educational">Educational Institution</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="campReason"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Purpose of Camp*
                </label>
                <textarea
                  id="campReason"
                  name="campReason"
                  required
                  value={formData.campReason}
                  onChange={handleChange}
                  rows="2"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Describe the main objectives of this health camp"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="border-b border-gray-200 pb-6">
            <div className="mb-4 flex items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </div>
              <h2 className="ml-2 text-lg font-semibold text-blue-700">
                Contact Information
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
              <div>
                <label
                  htmlFor="contactPerson"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Contact Person Name*
                </label>
                <input
                  type="text"
                  id="contactPerson"
                  name="contactPerson"
                  required
                  value={formData.contactPerson}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter contact person name"
                />
              </div>
              <div>
                <label
                  htmlFor="contactPhone"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Contact Phone*
                </label>
                <input
                  type="tel"
                  id="contactPhone"
                  name="contactPhone"
                  required
                  value={formData.contactPhone}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter phone number"
                />
              </div>
              <div className="md:col-span-2">
                <label
                  htmlFor="contactEmail"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Contact Email
                </label>
                <input
                  type="email"
                  id="contactEmail"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter email address"
                />
              </div>
            </div>
          </div>

          {/* Date and Time */}
          <div className="border-b border-gray-200 pb-6">
            <div className="mb-4 flex items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h2 className="ml-2 text-lg font-semibold text-blue-700">
                Date and Time Details
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
              <div>
                <label
                  htmlFor="startDate"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Start Date*
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  required
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="endDate"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  End Date*
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  required
                  value={formData.endDate}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="startTime"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Start Time*
                </label>
                <input
                  type="time"
                  id="startTime"
                  name="startTime"
                  required
                  value={formData.startTime}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="endTime"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  End Time*
                </label>
                <input
                  type="time"
                  id="endTime"
                  name="endTime"
                  required
                  value={formData.endTime}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="expectedAttendees"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Expected Number of Attendees*
                </label>
                <input
                  type="number"
                  id="expectedAttendees"
                  name="expectedAttendees"
                  required
                  value={formData.expectedAttendees}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter expected number"
                />
              </div>
            </div>
          </div>

          {/* Location Details with Address Dropdown */}
          <div className="border-b border-gray-200 pb-6">
            <div className="mb-4 flex items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <h2 className="ml-2 text-lg font-semibold text-blue-700">
                Venue Details
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
              <div className="relative md:col-span-2">
                <label
                  htmlFor="address"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Address*
                </label>
                <input
                  id="address"
                  name="address"
                  required
                  type="text"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Start typing your address"
                />

                {/* Address suggestions dropdown */}
                {addressSuggestions.length > 0 && (
                  <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-300 bg-white shadow-lg">
                    {addressSuggestions.map((suggestion, index) => (
                      <li
                        key={index}
                        onClick={() => handleAddressSelect(suggestion)}
                        className="cursor-pointer px-3 py-2 text-sm hover:bg-blue-50"
                      >
                        {suggestion.fullAddress}
                      </li>
                    ))}
                  </ul>
                )}

                {isLoadingSuggestions && (
                  <div className="absolute right-3 top-9">
                    <span className="text-sm text-gray-500">Loading...</span>
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor="city"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  City/Town*
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter city"
                />
              </div>
              <div>
                <label
                  htmlFor="state"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  State*
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  required
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter state"
                />
              </div>
              <div>
                <label
                  htmlFor="pincode"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Pincode*
                </label>
                <input
                  type="text"
                  id="pincode"
                  name="pincode"
                  required
                  value={formData.pincode}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter pincode"
                />
              </div>

              {/* Hidden fields for latitude and longitude */}
              <input type="hidden" name="latitude" value={formData.latitude} />
              <input
                type="hidden"
                name="longitude"
                value={formData.longitude}
              />

              {/* Display coordinates if available */}
              {formData.latitude && formData.longitude && (
                <div className="md:col-span-2">
                  <p className="text-xs text-gray-500">
                    Coordinates: {formData.latitude}, {formData.longitude}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Services Offered */}
          <div className="border-b border-gray-200 pb-6">
            <div className="mb-4 flex items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <h2 className="ml-2 text-lg font-semibold text-blue-700">
                Services Offered
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-x-6 gap-y-3 md:grid-cols-2">
              {medicalServiceOptions.map((service) => (
                <div key={service} className="flex items-center">
                  <input
                    type="checkbox"
                    id={service.replace(/\s+/g, "")}
                    name="medicalServices"
                    value={service}
                    checked={formData.medicalServices.includes(service)}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label
                    htmlFor={service.replace(/\s+/g, "")}
                    className="ml-2 text-sm text-gray-700"
                  >
                    {service}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Documents Upload */}
          <div className="border-b border-gray-200 pb-6">
            <div className="mb-4 flex items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h2 className="ml-2 text-lg font-semibold text-blue-700">
                Required Documents
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-y-5">
              <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4">
                <label
                  htmlFor="campImages"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Camp Location/Setup Images
                </label>
                <input
                  type="file"
                  id="campImages"
                  name="campImages"
                  onChange={handleChange}
                  accept="image/*"
                  multiple
                  className="mt-1 w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Upload images of the location where the camp will be held
                </p>
              </div>
              <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4">
                <label
                  htmlFor="policePermission"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Police Permission (PDF)*
                </label>
                <input
                  type="file"
                  id="policePermission"
                  name="policePermission"
                  required
                  onChange={handleChange}
                  accept=".pdf"
                  className="mt-1 w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Upload authorization letter from local police (PDF only)
                </p>
              </div>
              <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4">
                <label
                  htmlFor="localAuthPermission"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Local Authority Permission (PDF)*
                </label>
                <input
                  type="file"
                  id="localAuthPermission"
                  name="localAuthPermission"
                  required
                  onChange={handleChange}
                  accept=".pdf"
                  className="mt-1 w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Upload permission from municipal/local government (PDF only)
                </p>
              </div>
              <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4">
                <label
                  htmlFor="otherDocuments"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Other Supporting Documents
                </label>
                <input
                  type="file"
                  id="otherDocuments"
                  name="otherDocuments"
                  onChange={handleChange}
                  accept=".pdf,.doc,.docx"
                  className="mt-1 w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Upload any additional documents (PDF, DOC, DOCX)
                </p>
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div className="pb-6">
            <div className="mb-4 flex items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </div>
              <h2 className="ml-2 text-lg font-semibold text-blue-700">
                Additional Information
              </h2>
            </div>
            <div>
              <label
                htmlFor="additionalNotes"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Additional Notes
              </label>
              <textarea
                id="additionalNotes"
                name="additionalNotes"
                value={formData.additionalNotes}
                onChange={handleChange}
                rows="4"
                className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Add any additional information about the camp"
              ></textarea>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-4">
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-8 py-3 font-medium text-white shadow-md transition duration-300 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Submit Registration
            </button>
          </div>
        </form>
      </div>

      {/* Footer */}
      <div className="container mx-auto mt-8 px-4 text-center">
        <p className="text-sm text-gray-600">
          &copy; {new Date().getFullYear()} BookSmartly. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default HealthCampRegistrationForm;

