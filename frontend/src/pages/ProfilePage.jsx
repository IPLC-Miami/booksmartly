import { useState, useEffect } from "react";
import { useGetCurrentUser } from "../hooks/useGetCurrentUser";
import { useGetUserDetails } from "../hooks/useGetUserDetails";
import useGetClinicianProfileDetails from "../hooks/useGetClinicianProfileDetails";
import useGetReceptionProfileDetails from "../hooks/useGetReceptionProfileDetails";
import useUserRoleById from "../hooks/useUserRoleById";
import useHandleEditProfile from "../hooks/useHandleEditProfile";
import ProfilePictureUploader from "../components/ProfilePictureUploader";

function ProfilePage() {
  const [role, setRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  const tokenString = localStorage.getItem("sb-itbxttkivivyeqnduxjb-auth-token");
  const token = tokenString ? JSON.parse(tokenString) : null;
  const accessToken = token?.access_token;

  // Hooks
  const { data: dataUser } = useGetCurrentUser();
  const { data: dataRole } = useUserRoleById(userId, accessToken);
  const { data: userDetails, refetch: refetchUserDetails } = useGetUserDetails(userId, accessToken);
  const { data: clinicianDetails, refetch: refetchClinicianDetails } = useGetClinicianProfileDetails(userId, accessToken);
  const { data: receptionDetails, refetch: refetchReceptionDetails } = useGetReceptionProfileDetails(userId, accessToken);
  
  const { mutate: updateProfile, isPending: isUpdating } = useHandleEditProfile();

  // Set user ID when user data is available
  useEffect(() => {
    if (token && dataUser) {
      setUserId(dataUser?.user?.id);
    }
  }, [dataUser, token]);

  // Set role when role data is available
  useEffect(() => {
    if (dataRole?.data && dataRole.data.length > 0) {
      setRole(dataRole.data[0].role);
    }
  }, [dataRole]);

  // Initialize form data based on role and profile data
  useEffect(() => {
    if (role && userDetails) {
      let initialData = {
        name: userDetails.data?.name || "",
        email: userDetails.data?.email || "",
        phone: userDetails.data?.phone || "",
        address: userDetails.data?.address || "",
        date_of_birth: userDetails.data?.date_of_birth || "",
        gender: userDetails.data?.gender || "",
      };

      // Add role-specific fields
      if (role === "clinician" && clinicianDetails?.data) {
        initialData = {
          ...initialData,
          specialization: clinicianDetails.data.specialization || "",
          license_number: clinicianDetails.data.license_number || "",
          years_of_experience: clinicianDetails.data.years_of_experience || "",
          education: clinicianDetails.data.education || "",
          bio: clinicianDetails.data.bio || "",
          consultation_fee: clinicianDetails.data.consultation_fee || "",
          hospital_id: clinicianDetails.data.hospital_id || "",
        };
      } else if (role === "reception" && receptionDetails?.data) {
        initialData = {
          ...initialData,
          employee_id: receptionDetails.data.employee_id || "",
          department: receptionDetails.data.department || "",
          shift_timing: receptionDetails.data.shift_timing || "",
          hospital_id: receptionDetails.data.hospital_id || "",
        };
      } else if (role === "health_worker" && userDetails.data) {
        initialData = {
          ...initialData,
          worker_type: userDetails.data.worker_type || "",
          certification: userDetails.data.certification || "",
          assigned_area: userDetails.data.assigned_area || "",
        };
      }

      setFormData(initialData);
    }
  }, [role, userDetails, clinicianDetails, receptionDetails]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  // Validate form data
  const validateForm = () => {
    const errors = {};

    // Common validations
    if (!formData.name?.trim()) {
      errors.name = "Name is required";
    }
    if (!formData.email?.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid";
    }
    if (!formData.phone?.trim()) {
      errors.phone = "Phone number is required";
    } else if (!/^\+?[\d\s-()]+$/.test(formData.phone)) {
      errors.phone = "Phone number is invalid";
    }

    // Role-specific validations
    if (role === "clinician") {
      if (!formData.specialization?.trim()) {
        errors.specialization = "Specialization is required";
      }
      if (!formData.license_number?.trim()) {
        errors.license_number = "License number is required";
      }
      if (formData.consultation_fee && isNaN(formData.consultation_fee)) {
        errors.consultation_fee = "Consultation fee must be a number";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    updateProfile(
      { userId, accessToken, editedProfile: formData },
      {
        onSuccess: () => {
          setSuccessMessage("Profile updated successfully!");
          setIsEditing(false);
          // Refetch data based on role
          refetchUserDetails();
          if (role === "clinician") {
            refetchClinicianDetails();
          } else if (role === "reception") {
            refetchReceptionDetails();
          }
          
          // Clear success message after 3 seconds
          setTimeout(() => setSuccessMessage(""), 3000);
        },
        onError: (error) => {
          setValidationErrors({ general: error.message || "Failed to update profile" });
        }
      }
    );
  };

  // Handle profile picture upload success
  const handleProfilePictureSuccess = () => {
    refetchUserDetails();
    setSuccessMessage("Profile picture updated successfully!");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  // Render form fields based on role
  const renderRoleSpecificFields = () => {
    if (role === "clinician") {
      return (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Specialization *
              </label>
              <input
                type="text"
                name="specialization"
                value={formData.specialization || ""}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  !isEditing ? "bg-gray-50" : "bg-white"
                } ${validationErrors.specialization ? "border-red-500" : "border-gray-300"}`}
              />
              {validationErrors.specialization && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.specialization}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                License Number *
              </label>
              <input
                type="text"
                name="license_number"
                value={formData.license_number || ""}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  !isEditing ? "bg-gray-50" : "bg-white"
                } ${validationErrors.license_number ? "border-red-500" : "border-gray-300"}`}
              />
              {validationErrors.license_number && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.license_number}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Years of Experience
              </label>
              <input
                type="number"
                name="years_of_experience"
                value={formData.years_of_experience || ""}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  !isEditing ? "bg-gray-50" : "bg-white"
                } border-gray-300`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Consultation Fee
              </label>
              <input
                type="number"
                name="consultation_fee"
                value={formData.consultation_fee || ""}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  !isEditing ? "bg-gray-50" : "bg-white"
                } ${validationErrors.consultation_fee ? "border-red-500" : "border-gray-300"}`}
              />
              {validationErrors.consultation_fee && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.consultation_fee}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Education
            </label>
            <textarea
              name="education"
              value={formData.education || ""}
              onChange={handleInputChange}
              disabled={!isEditing}
              rows={3}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                !isEditing ? "bg-gray-50" : "bg-white"
              } border-gray-300`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <textarea
              name="bio"
              value={formData.bio || ""}
              onChange={handleInputChange}
              disabled={!isEditing}
              rows={4}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                !isEditing ? "bg-gray-50" : "bg-white"
              } border-gray-300`}
            />
          </div>
        </>
      );
    }

    if (role === "reception") {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employee ID
            </label>
            <input
              type="text"
              name="employee_id"
              value={formData.employee_id || ""}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                !isEditing ? "bg-gray-50" : "bg-white"
              } border-gray-300`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <input
              type="text"
              name="department"
              value={formData.department || ""}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                !isEditing ? "bg-gray-50" : "bg-white"
              } border-gray-300`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Shift Timing
            </label>
            <input
              type="text"
              name="shift_timing"
              value={formData.shift_timing || ""}
              onChange={handleInputChange}
              disabled={!isEditing}
              placeholder="e.g., 9:00 AM - 5:00 PM"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                !isEditing ? "bg-gray-50" : "bg-white"
              } border-gray-300`}
            />
          </div>
        </div>
      );
    }

    if (role === "health_worker") {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Worker Type
            </label>
            <select
              name="worker_type"
              value={formData.worker_type || ""}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                !isEditing ? "bg-gray-50" : "bg-white"
              } border-gray-300`}
            >
              <option value="">Select worker type</option>
              <option value="community_health_worker">Community Health Worker</option>
              <option value="health_educator">Health Educator</option>
              <option value="outreach_coordinator">Outreach Coordinator</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Certification
            </label>
            <input
              type="text"
              name="certification"
              value={formData.certification || ""}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                !isEditing ? "bg-gray-50" : "bg-white"
              } border-gray-300`}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assigned Area
            </label>
            <input
              type="text"
              name="assigned_area"
              value={formData.assigned_area || ""}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                !isEditing ? "bg-gray-50" : "bg-white"
              } border-gray-300`}
            />
          </div>
        </div>
      );
    }

    return null;
  };

  if (!role || !userDetails) {
    return (
      <div className="mb-24 mt-12 flex flex-col overflow-hidden p-4 font-noto md:px-12 md:py-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-24 mt-12 flex flex-col overflow-hidden p-4 font-noto md:px-12 md:py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600 mt-2">
          Manage your account settings and personal information
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-800">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Profile Picture Section */}
        <div className="px-6 py-8 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h2>
          <ProfilePictureUploader
            currentProfilePicture={userDetails.data?.profile_picture_url}
            onUploadSuccess={handleProfilePictureSuccess}
          />
        </div>

        {/* Profile Information Section */}
        <div className="px-6 py-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
            <div className="flex space-x-3">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setValidationErrors({});
                      // Reset form data
                      if (role && userDetails) {
                        let resetData = {
                          name: userDetails.data?.name || "",
                          email: userDetails.data?.email || "",
                          phone: userDetails.data?.phone || "",
                          address: userDetails.data?.address || "",
                          date_of_birth: userDetails.data?.date_of_birth || "",
                          gender: userDetails.data?.gender || "",
                        };
                        if (role === "clinician" && clinicianDetails?.data) {
                          resetData = { ...resetData, ...clinicianDetails.data };
                        } else if (role === "reception" && receptionDetails?.data) {
                          resetData = { ...resetData, ...receptionDetails.data };
                        }
                        setFormData(resetData);
                      }
                    }}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isUpdating}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isUpdating ? "Saving..." : "Save Changes"}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* General Error Message */}
          {validationErrors.general && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{validationErrors.general}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name || ""}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      !isEditing ? "bg-gray-50" : "bg-white"
                    } ${validationErrors.name ? "border-red-500" : "border-gray-300"}`}
                  />
                  {validationErrors.name && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email || ""}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      !isEditing ? "bg-gray-50" : "bg-white"
                    } ${validationErrors.email ? "border-red-500" : "border-gray-300"}`}
                  />
                  {validationErrors.email && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone || ""}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      !isEditing ? "bg-gray-50" : "bg-white"
                    } ${validationErrors.phone ? "border-red-500" : "border-gray-300"}`}
                  />
                  {validationErrors.phone && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={formData.date_of_birth || ""}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      !isEditing ? "bg-gray-50" : "bg-white"
                    } border-gray-300`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender || ""}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      !isEditing ? "bg-gray-50" : "bg-white"
                    } border-gray-300`}
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  name="address"
                  value={formData.address || ""}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    !isEditing ? "bg-gray-50" : "bg-white"
                  } border-gray-300`}
                />
              </div>
            </div>

            {/* Role-specific Information */}
            {role !== "client" && (
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-4">
                  {role === "clinician" ? "Professional Information" : 
                   role === "reception" ? "Employment Information" : 
                   "Work Information"}
                </h3>
                {renderRoleSpecificFields()}
              </div>
            )}

            {/* Role Badge */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Role:</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  role === "clinician" ? "bg-blue-100 text-blue-800" :
                  role === "reception" ? "bg-green-100 text-green-800" :
                  role === "health_worker" ? "bg-purple-100 text-purple-800" :
                  "bg-gray-100 text-gray-800"
                }`}>
                  {role === "clinician" ? "Clinician" :
                   role === "reception" ? "Reception" :
                   role === "health_worker" ? "Health Worker" :
                   "Client"}
                </span>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;