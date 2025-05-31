import React, { useState, useEffect } from "react";
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  FileText,
  Image,
  Phone,
  Mail,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Filter,
  Check,
} from "lucide-react";
//Trianlge Coloring
const HealthCampsList = ({
  userRole,
  userLocation,
  onVolunteer,
  volunteeredCamps = [],
}) => {
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const api = import.meta.env.VITE_API_BASE_URL;
  const [expandedCamp, setExpandedCamp] = useState(null);
  const [sortBy, setSortBy] = useState("date");
  const [filterBy, setFilterBy] = useState("all");

  useEffect(() => {
    // console.log("Volunteered camps:", volunteeredCamps);
    const fetchCamps = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${api}/api/healthWorkerRoutes/healthcamps`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch health camps");
        }

        const data = await response.json();
        setCamps(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching health camps:", err);
        setError(err.message);
        setCamps([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCamps();
  }, []);

  const toggleExpand = (campId) => {
    setExpandedCamp(expandedCamp === campId ? null : campId);
  };

  const handleSortChange = (option) => {
    setSortBy(option);
  };

  const handleFilterChange = (option) => {
    setFilterBy(option);
  };

  const handleVolunteer = (campInfo) => {
    if (onVolunteer) onVolunteer(campInfo);
  };

  // Fixed function to check if the clinician has already volunteered for a specific camp
  const hasVolunteered = (campId) => {
    // Ensure volunteeredCamps is an array and not undefined
    if (!Array.isArray(volunteeredCamps)) return false;

    // If volunteeredCamps contains objects with _id property
    if (volunteeredCamps.some((camp) => typeof camp === "object")) {
      return volunteeredCamps.some(
        (camp) =>
          (camp._id && camp._id === campId) ||
          (camp.camp && camp.camp._id === campId),
      );
    }

    // If volunteeredCamps is an array of IDs
    return volunteeredCamps.includes(campId);
  };

  const getSortedCamps = () => {
    let filteredCamps = [...camps];

    // Apply filters
    if (filterBy !== "all") {
      filteredCamps = filteredCamps.filter(
        (camp) =>
          camp.medicalServices && camp.medicalServices.includes(filterBy),
      );
    }

    // Apply sorting
    if (sortBy === "distance" && userLocation) {
      return filteredCamps.sort((a, b) => {
        const distA = calculateDistance(userLocation, {
          lat: a.latitude,
          lng: a.longitude,
        });
        const distB = calculateDistance(userLocation, {
          lat: b.latitude,
          lng: b.longitude,
        });
        return distA - distB;
      });
    } else {
      return filteredCamps.sort(
        (a, b) => new Date(a.startDate) - new Date(b.startDate),
      );
    }
  };

  const calculateDistance = (pos1, pos2) => {
    if (!pos1.lat || !pos1.lng || !pos2.lat || !pos2.lng) return 9999;
    const latDiff = pos1.lat - pos2.lat;
    const lngDiff = pos1.lng - pos2.lng;
    return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
  };

  const getColorClasses = (index) => {
    const colors = ["blue", "indigo", "purple", "teal", "cyan"];
    const color = colors[index % colors.length];

    const colorMap = {
      blue: {
        border: "border-blue-400",
        bg: "bg-blue-500",
        bgLight: "bg-blue-50",
        text: "text-blue-600",
        hover: "hover:bg-blue-600",
        gradient: "from-blue-500 to-blue-600",
        badge: "bg-blue-100 text-blue-800",
      },
      indigo: {
        border: "border-indigo-400",
        bg: "bg-indigo-500",
        bgLight: "bg-indigo-50",
        text: "text-indigo-600",
        hover: "hover:bg-indigo-600",
        gradient: "from-indigo-500 to-indigo-600",
        badge: "bg-indigo-100 text-indigo-800",
      },
      purple: {
        border: "border-purple-400",
        bg: "bg-purple-500",
        bgLight: "bg-purple-50",
        text: "text-purple-600",
        hover: "hover:bg-purple-600",
        gradient: "from-purple-500 to-purple-600",
        badge: "bg-purple-100 text-purple-800",
      },
      teal: {
        border: "border-teal-400",
        bg: "bg-teal-500",
        bgLight: "bg-teal-50",
        text: "text-teal-600",
        hover: "hover:bg-teal-600",
        gradient: "from-teal-500 to-teal-600",
        badge: "bg-teal-100 text-teal-800",
      },
      cyan: {
        border: "border-cyan-400",
        bg: "bg-cyan-500",
        bgLight: "bg-cyan-50",
        text: "text-cyan-600",
        hover: "hover:bg-cyan-600",
        gradient: "from-cyan-500 to-cyan-600",
        badge: "bg-cyan-100 text-cyan-800",
      },
    };

    return colorMap[color];
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const sortedCamps = getSortedCamps();

  // Get all unique medical services for filter
  const allServices = camps.reduce((acc, camp) => {
    if (camp.medicalServices && Array.isArray(camp.medicalServices)) {
      camp.medicalServices.forEach((service) => {
        if (!acc.includes(service)) acc.push(service);
      });
    }
    return acc;
  }, []);

  return (
    <div className="mx-auto w-full max-w-6xl p-4">
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-gradient-to-br from-gray-50 to-white shadow-xl">
        {/* Header section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h1 className="text-3xl font-bold">Free Health Checkup Camps</h1>
              <p className="mt-1 text-blue-100">
                Find and volunteer at health camps near you
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {/* Sort options */}
              <div className="flex rounded-lg bg-white/20 p-1 shadow-sm backdrop-blur-sm">
                <button
                  onClick={() => handleSortChange("date")}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                    sortBy === "date"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-white hover:bg-white/10"
                  }`}
                >
                  Sort by Date
                </button>
                <button
                  onClick={() => handleSortChange("distance")}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                    sortBy === "distance"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-white hover:bg-white/10"
                  }`}
                >
                  Sort by Distance
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filter section */}
        {allServices.length > 0 && (
          <div className="overflow-x-auto border-b border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                Filter by service:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleFilterChange("all")}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                    filterBy === "all"
                      ? "bg-blue-100 text-blue-800"
                      : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  All Services
                </button>
                {allServices.map((service, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleFilterChange(service)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                      filterBy === service
                        ? "bg-blue-100 text-blue-800"
                        : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {service}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="py-16 text-center">
            <div className="inline-flex items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
            </div>
            <p className="mt-4 text-gray-500">Loading health camps...</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="py-16 text-center">
            <div className="inline-flex rounded-full bg-red-100 p-4">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              Error loading health camps
            </h3>
            <p className="mt-1 text-gray-500">{error}</p>
          </div>
        )}

        {/* List content */}
        {!loading && !error && (
          <div className="p-6">
            {sortedCamps.length === 0 ? (
              <div className="py-16 text-center">
                <div className="inline-flex rounded-full bg-blue-100 p-4">
                  <MapPin size={32} className="text-blue-600" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  No health camps available
                </h3>
                <p className="mt-1 text-gray-500">
                  No camps match your current filters or location.
                </p>
                {filterBy !== "all" && (
                  <button
                    onClick={() => setFilterBy("all")}
                    className="mt-4 font-medium text-blue-600 hover:text-blue-700"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {sortedCamps.map((camp, index) => {
                  const colors = getColorClasses(index);
                  const isExpanded = expandedCamp === index;
                  // Check if this camp is in the volunteeredCamps array
                  // console.log("camp", camp);
                  const isVolunteered = hasVolunteered(camp.id);

                  return (
                    <div
                      key={index}
                      className={`overflow-hidden rounded-xl border ${isExpanded ? colors.border : "border-gray-200"} bg-white transition-all duration-300 ${isExpanded ? "shadow-md" : "hover:shadow-sm"}`}
                    >
                      <div
                        className={`flex cursor-pointer items-center justify-between p-4 transition-colors ${isExpanded ? colors.bgLight : "hover:bg-gray-50"}`}
                        onClick={() => toggleExpand(index)}
                      >
                        <div className="flex items-center space-x-4">
                          <div
                            className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${colors.gradient} text-white shadow-sm`}
                          >
                            <MapPin size={22} />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-800">
                              {camp.campName || "Health Camp"}
                            </h3>
                            <div className="mt-1 flex items-center">
                              <Calendar
                                size={14}
                                className="mr-1 text-gray-400"
                              />
                              <span className="text-sm text-gray-600">
                                {formatDate(camp.startDate)}
                              </span>
                              <span className="mx-2 text-gray-300">•</span>
                              <MapPin
                                size={14}
                                className="mr-1 text-gray-400"
                              />
                              <span className="text-sm text-gray-600">
                                {camp.city}
                                {camp.state ? `, ${camp.state}` : ""}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          {userRole === "clinician" &&
                            (isVolunteered ? (
                              <div className="flex items-center rounded-lg bg-green-50 px-4 py-2 text-green-700">
                                <Check
                                  size={16}
                                  className="mr-1 text-green-600"
                                />
                                <span className="font-medium">Volunteered</span>
                              </div>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleVolunteer({ id: camp._id, camp });
                                }}
                                className={`rounded-lg px-4 py-2 ${colors.bg} ${colors.hover} text-white shadow-sm transition-all`}
                              >
                                Volunteer
                              </button>
                            ))}
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${isExpanded ? colors.bg : "bg-gray-100"}`}
                          >
                            {isExpanded ? (
                              <ChevronUp
                                size={18}
                                className={
                                  isExpanded ? "text-white" : "text-gray-500"
                                }
                              />
                            ) : (
                              <ChevronDown
                                size={18}
                                className="text-gray-500"
                              />
                            )}
                          </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="border-t border-gray-100 p-6">
                          {/* Services Tags */}
                          {camp.medicalServices &&
                            camp.medicalServices.length > 0 && (
                              <div className="mb-6">
                                <div className="flex flex-wrap gap-2">
                                  {camp.medicalServices.map((service, idx) => (
                                    <span
                                      key={idx}
                                      className={`rounded-full px-3 py-1 text-sm ${colors.badge}`}
                                    >
                                      {service}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                            <div>
                              <h4 className="mb-4 text-lg font-semibold text-gray-800">
                                Camp Details
                              </h4>
                              <div className="space-y-5">
                                <div className="flex">
                                  <Calendar
                                    size={18}
                                    className="mr-3 mt-1 text-gray-400"
                                  />
                                  <div>
                                    <p className="font-medium text-gray-700">
                                      Dates
                                    </p>
                                    <p className="text-gray-600">
                                      {formatDate(camp.startDate)} -{" "}
                                      {formatDate(camp.endDate)}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex">
                                  <Clock
                                    size={18}
                                    className="mr-3 mt-1 text-gray-400"
                                  />
                                  <div>
                                    <p className="font-medium text-gray-700">
                                      Timings
                                    </p>
                                    <p className="text-gray-600">
                                      {camp.startTime || "9:00 AM"} -{" "}
                                      {camp.endTime || "5:00 PM"}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex">
                                  <MapPin
                                    size={18}
                                    className="mr-3 mt-1 text-gray-400"
                                  />
                                  <div>
                                    <p className="font-medium text-gray-700">
                                      Location
                                    </p>
                                    <p className="text-gray-600">
                                      {camp.address || "Address not provided"}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      {camp.city}
                                      {camp.state ? `, ${camp.state}` : ""}{" "}
                                      {camp.pincode || ""}
                                    </p>
                                  </div>
                                </div>

                                {camp.campReason && (
                                  <div className="flex">
                                    <FileText
                                      size={18}
                                      className="mr-3 mt-1 text-gray-400"
                                    />
                                    <div>
                                      <p className="font-medium text-gray-700">
                                        About this camp
                                      </p>
                                      <p className="text-gray-600">
                                        {camp.campReason}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div>
                              <h4 className="mb-4 text-lg font-semibold text-gray-800">
                                Organizer Information
                              </h4>
                              <div className="space-y-5">
                                <div className="flex">
                                  <Users
                                    size={18}
                                    className="mr-3 mt-1 text-gray-400"
                                  />
                                  <div>
                                    <p className="font-medium text-gray-700">
                                      Organizer
                                    </p>
                                    <p className="text-gray-600">
                                      {camp.organizerName || "Not specified"}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      {camp.organizationType || "NGO"}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex">
                                  <Phone
                                    size={18}
                                    className="mr-3 mt-1 text-gray-400"
                                  />
                                  <div>
                                    <p className="font-medium text-gray-700">
                                      Contact
                                    </p>
                                    <p className="text-gray-600">
                                      {camp.contactPerson || "Not specified"}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      {camp.contactPhone || "No phone provided"}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      {camp.contactEmail || "No email provided"}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex">
                                  <Users
                                    size={18}
                                    className="mr-3 mt-1 text-gray-400"
                                  />
                                  <div>
                                    <p className="font-medium text-gray-700">
                                      Attendees
                                    </p>
                                    <p className="text-gray-600">
                                      Expected:{" "}
                                      {camp.expectedAttendees ||
                                        "Not specified"}
                                    </p>
                                  </div>
                                </div>

                                {camp.additionalNotes && (
                                  <div className="flex">
                                    <FileText
                                      size={18}
                                      className="mr-3 mt-1 text-gray-400"
                                    />
                                    <div>
                                      <p className="font-medium text-gray-700">
                                        Additional Notes
                                      </p>
                                      <p className="text-gray-600">
                                        {camp.additionalNotes}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Documents section */}
                          <div className="mt-8 border-t border-gray-100 pt-6">
                            <h4 className="mb-4 text-lg font-semibold text-gray-800">
                              Documents & Resources
                            </h4>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                              {camp.campImages && (
                                <a
                                  href={camp.campImages}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="group flex items-center rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
                                >
                                  <div
                                    className={`h-10 w-10 rounded-lg ${colors.bgLight} mr-3 flex items-center justify-center transition-transform group-hover:scale-110`}
                                  >
                                    <Image size={20} className={colors.text} />
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900">
                                      Camp Images
                                    </p>
                                    <div className="mt-1 flex items-center text-sm text-blue-600">
                                      <span>View gallery</span>
                                      <ExternalLink
                                        size={12}
                                        className="ml-1"
                                      />
                                    </div>
                                  </div>
                                </a>
                              )}

                              {camp.policePermission && (
                                <a
                                  href={camp.policePermission}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="group flex items-center rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
                                >
                                  <div
                                    className={`h-10 w-10 rounded-lg ${colors.bgLight} mr-3 flex items-center justify-center transition-transform group-hover:scale-110`}
                                  >
                                    <FileText
                                      size={20}
                                      className={colors.text}
                                    />
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900">
                                      Police Permission
                                    </p>
                                    <div className="mt-1 flex items-center text-sm text-blue-600">
                                      <span>View document</span>
                                      <ExternalLink
                                        size={12}
                                        className="ml-1"
                                      />
                                    </div>
                                  </div>
                                </a>
                              )}

                              {camp.localAuthPermission && (
                                <a
                                  href={camp.localAuthPermission}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="group flex items-center rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
                                >
                                  <div
                                    className={`h-10 w-10 rounded-lg ${colors.bgLight} mr-3 flex items-center justify-center transition-transform group-hover:scale-110`}
                                  >
                                    <FileText
                                      size={20}
                                      className={colors.text}
                                    />
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900">
                                      Authority Permission
                                    </p>
                                    <div className="mt-1 flex items-center text-sm text-blue-600">
                                      <span>View document</span>
                                      <ExternalLink
                                        size={12}
                                        className="ml-1"
                                      />
                                    </div>
                                  </div>
                                </a>
                              )}

                              {camp.otherDocuments && (
                                <a
                                  href={camp.otherDocuments}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="group flex items-center rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
                                >
                                  <div
                                    className={`h-10 w-10 rounded-lg ${colors.bgLight} mr-3 flex items-center justify-center transition-transform group-hover:scale-110`}
                                  >
                                    <FileText
                                      size={20}
                                      className={colors.text}
                                    />
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900">
                                      Other Documents
                                    </p>
                                    <div className="mt-1 flex items-center text-sm text-blue-600">
                                      <span>View document</span>
                                      <ExternalLink
                                        size={12}
                                        className="ml-1"
                                      />
                                    </div>
                                  </div>
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthCampsList;
