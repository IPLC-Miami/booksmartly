import { CameraIcon, Pencil2Icon } from "@radix-ui/react-icons";
import { Avatar, Button, Flex, Skeleton } from "@radix-ui/themes";
import { useEffect, useState } from "react";
import EditProfile from "./EditProfile";
import AppointmentCard from "./AppointmentCard";
import useGetUpcomingAppointments from "../../hooks/useGetUpcomingAppointments";
import Loader from "../Loader";
import { supabase } from "../../utils/supabaseClient";
import { useNavigate } from "react-router-dom";
import { useGetUserDetails } from "../../hooks/useGetUserDetails";
import useUpdateUserProfilePicture from "../../hooks/useUpdateUserProfilePicture";
import { toast } from "sonner";
import patientBanner from "../../assets/patientBanner.jpg";

function ProfileTab() {
  const [userId, setUserId] = useState(null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const tokenString = localStorage.getItem(
    "sb-itbxttkivivyeqnduxjb-auth-token",
  );
  const token = JSON?.parse(tokenString);
  useEffect(() => {
    // // console.log("ggggg", token);
    if (!token) {
      toast.error("Session Expired Please Login Again.");
      navigate("/login", { state: { sessionExpiration: true } }); // Redirect to login page
    }
  }, [token]);
  const accessToken = token?.access_token;

  // const MyComponent = () => {
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const {
    isLoading: isLoadingDetails,
    data: dataDetails,
    error: errorDetails,
    refetch: refetchDetails,
    isFetching: isFetchingDetails,
  } = useGetUserDetails(userId, accessToken);
  const { mutate, onSuccess, onError } = useUpdateUserProfilePicture();

  const [profile, setProfile] = useState({
    userId: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    profileImage: "",
    age: "",
    gender: "",
    phone_verified: "",
  });
  const profileImagePlaceholder =
    "https://static.vecteezy.com/system/resources/thumbnails/003/337/584/small/default-avatar-photo-placeholder-profile-icon-vector.jpg";
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      // console.log("Session Data:", data);
      if (error) {
        console.error("Session Error:", error);
        navigate("/login");
      }
    };
    //can enter a toast here user not authenticated to view this page
    checkUserSession();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
      if (error) console.error("Error fetching user:", error);
    };
    fetchUser();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setProfile({
        name: dataDetails.profile.name || "",
        email: dataDetails.profile.email || "",
        phone: dataDetails.profile.phone_number || "",
        address: dataDetails.profile.address || "",
        profileImage: dataDetails.profile.avatar_url || "",
        age: dataDetails.profile.age || null,
        gender: dataDetails.profile.gender || "",
        phone_verified: dataDetails.profile.phone_verified,
      });
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  useEffect(() => {
    // console.log("hello", " data details/userId changed ", userId);
    if (dataDetails) fetchUserProfile();
  }, [userId, dataDetails]);
  const patientId = userId;

  const { isLoading, data, error, status, refetch, isFetching } =
    useGetUpcomingAppointments(patientId);

  const [appointmentsToday, setAppointmentsToday] = useState([]);
  useEffect(() => {
    if (data) {
      // console.log("Data:", data);
      const today = new Date().toISOString().split("T")[0];
      const appointments = data.filter(
        (appointment) => appointment.appointment_date === today,
      );
      setAppointmentsToday(appointments);
    }
  }, [data]);
  // console.log(profile);

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    // console.log("in handle upload", file);

    if (!file) {
      console.error("No file selected");
      return;
    }
    // console.log("file: ", file);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", userId);
    // console.log(" formdata in frontend1", formData);
    mutate.mutate(
      { userId: userId, accessToken, formData },
      {
        onSuccess: (data) => {
          // console.log("ProfilePicture Uploaded sucessfully:", data);
          refetchDetails();
          // // console.log("2222");
          // fetchUserProfile();
        },
        onError: (error) => {
          console.error(
            "Error uploading profile picture:",
            error.response?.data || error.message,
          );
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-y-6">
      {(isLoading || isFetchingDetails) && <Loader />}
      <div className="relative flex flex-col overflow-hidden rounded-md">
        <img
          src={patientBanner}
          alt="Patient banner background"
          className="h-48 w-full rounded-lg object-cover sm:h-56 md:h-64 lg:h-72"
        />

        <div className="absolute inset-0 flex flex-col justify-center px-4 font-inter text-white drop-shadow-lg sm:px-6 md:px-12">
          {profile.name ? (
            <>
              <div className="text-lg font-semibold sm:text-xl">Welcome,</div>
              <div className="text-2xl font-semibold sm:text-3xl md:text-4xl">
                {profile.gender?.toLowerCase() === "male" ? "Mr." : "Ms."}{" "}
                {profile.name?.charAt(0).toUpperCase() + profile.name?.slice(1)}
              </div>
              <div className="mt-1 text-base sm:text-lg">
                You have {appointmentsToday?.length} appointments scheduled for
                today.
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-y-2 text-lg font-semibold sm:text-xl">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-8 w-36" />
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col justify-start gap-x-4 rounded-md border px-8 py-4 text-xs sm:gap-x-12 md:flex-row md:text-sm">
        <div className="flex flex-col items-center justify-center p-4">
          <Flex gap="2" className="relative">
            <Avatar
              size={{
                initial: "4",
                sm: "5",
                md: "6",
              }}
              radius="full"
              src={profile.profileImage}
              fallback={profile.name[0]?.toUpperCase()}
            />
            <div className="p-image absolute bottom-0 right-0 w-6 cursor-pointer rounded-full border-black bg-white p-[2px] transition-all duration-300 hover:scale-110">
              <span className="z-20">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
                  <rect width="256" height="256" fill="none" />
                  <path
                    d="M208,208H48a16,16,0,0,1-16-16V80A16,16,0,0,1,48,64H80L96,40h64l16,24h32a16,16,0,0,1,16,16V192A16,16,0,0,1,208,208Z"
                    fill="none"
                    stroke="#222222"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="16"
                  />
                  <circle
                    cx="128"
                    cy="132"
                    r="36"
                    fill="none"
                    stroke="#222222"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="16"
                  />
                </svg>
              </span>
              <input
                className="file-upload absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                type="file"
                accept="image/*"
                onChange={handleUpload}
                id="profile-image-upload"
              />
            </div>
          </Flex>
          {/* <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            id="profile-image-upload"
            // style={{ display: "none" }} // Hide the input field
          /> */}

          <div className="mt-1 w-32 text-center">{profile.name}</div>
        </div>
        <div className="flex flex-col justify-center gap-3">
          <div>
            <span className="font-semibold">Email:</span> {profile?.email}
          </div>
          <div>
            <span className="font-semibold">Phone:</span> {profile?.phone}
          </div>
          <div>
            <span className="font-semibold">Address:</span> {profile?.address}
          </div>
          <div>
            <span className="font-semibold">Age & Gender:</span> {profile?.age}{" "}
            {profile.gender}
          </div>
          <div>
            <EditProfile
              id={userId}
              profile={profile}
              setProfile={setProfile}
              fetchUserProfile={fetchUserProfile}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-y-3">
        <div className="text-base font-semibold">
          Appointments scheduled for today
        </div>
        {appointmentsToday?.map((appointment, ix) => (
          <AppointmentCard key={ix} data={appointment} index={ix} />
        ))}
        {appointmentsToday?.length === 0 && (
          <div className="text-sm text-gray-400">No appointments today</div>
        )}
      </div>
    </div>
  );
}

export default ProfileTab;

