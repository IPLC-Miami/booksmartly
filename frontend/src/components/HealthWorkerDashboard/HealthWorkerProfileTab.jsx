import { Avatar, Badge, Code, Flex } from "@radix-ui/themes";
import { useEffect, useState } from "react";
import useGetReceptionProfileDetails from "../../hooks/useGetReceptionProfileDetails.js";
import Loader from "../Loader.jsx";
import { supabase } from "../../utils/supabaseClient.js";
import { useNavigate } from "react-router-dom";
import { data } from "autoprefixer";
import { toast } from "sonner";
import { useGetUserDetails } from "../../hooks/useGetUserDetails";

const API_URL = import.meta.env.VITE_API_BASE_URL;

function HealthWorkerProfileTab() {
  const tokenString = localStorage.getItem(
    "sb-itbxttkivivyeqnduxjb-auth-token",
  );

  const token = JSON?.parse(tokenString);
  const [userId, setUserId] = useState(token?.user?.id || null);
  const accessToken = token?.access_token;

  const {
    isLoading: isLoadingDetails,
    data: dataDetails,
    error: errorDetails,
    refetch: refetchDetails,
    isFetching: isFetchingDetails,
  } = useGetUserDetails(userId, accessToken);
  const [profile, setProfile] = useState({
    name: dataDetails?.profile?.name || "",
    email: dataDetails?.profile?.email || "",
    address: dataDetails?.profile?.address || "",
    profileImage: dataDetails?.profile?.avatar_url || "",
    qrcode: dataDetails?.profile?.qrcode || "",
    uid: 234,
  });
  console.log(dataDetails);
  console.log(profile);
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  const profileImagePlaceholder =
    "https://static.vecteezy.com/system/resources/thumbnails/003/337/584/small/default-avatar-photo-placeholder-profile-icon-vector.jpg";
  // const [userId, setUserId] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    // // console.log("ggggg", token);
    if (!token) {
      toast.error("Session Expired Please Login Again.");
      navigate("/login", { state: { sessionExpiration: true } }); // Redirect to login page
    }
  }, [token]);

  // const MyComponent = () => {
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const checkUserSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      // console.log("Session Data:", data);
      if (error) {
        console.error("Session Error:", error);
        // navigate("/login");
        navigate("/login", { state: { sessionExpiration: true } }); // Redirect to login page
      }
    };
    //can enter a toast here user not authenticated to view this page
    checkUserSession();
  }, []);

  // useEffect(() => {
  //   const fetchUser = async () => {
  //     const {
  //       data: { user },
  //       error,
  //     } = await supabase.auth.getUser();
  //     if (user) setUserId(user.id);
  //     if (error) console.error("Error fetching user:", error);
  //   };
  //   fetchUser();
  // }, []);

  const fetchUserProfile = async () => {
    try {
      if (dataDetails) {
        console.log(dataDetails);
        setProfile({
          name: dataDetails.profile.name || "",
          email: dataDetails.profile.email || "",
          address: dataDetails.profile.address || "",
          age: dataDetails.profile.age || "",
          gender: dataDetails.profile.gender || "",
          phone: dataDetails.profile.phone_number || "",

          profileImage: dataDetails.profile.avatar_url,
        });
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  useEffect(() => {
    // console.log("hello", " ", userId);
    if (userId) fetchUserProfile();
  }, [userId, dataDetails]);

  useEffect(() => {
    // console.log("profile ", profile);
  }, [profile]);

  //   return (
  //     <div className="flex flex-col gap-y-6">
  //       {isFetchingDetails && <Loader />}
  //       <div className="flex flex-col justify-start gap-x-4 rounded-md border px-8 py-4 text-xs sm:gap-x-12 md:flex-row md:text-sm">
  //         <div className="flex flex-col items-center justify-center p-4">
  //           <Flex gap="2">
  //             <Avatar
  //               size={{
  //                 initial: "4",
  //                 sm: "5",
  //                 md: "6",
  //               }}
  //               radius="full"
  //               src={profile.profileImage || profileImagePlaceholder}
  //               //   fallback={profile.name[0]?.toUpperCase()}
  //             />
  //           </Flex>
  //           {/* <div className="mt-1 w-32 text-center">{profile.name}</div> */}
  //         </div>
  //         <div className="flex flex-col justify-center gap-3">
  //           <div>
  //             <span className="font-semibold">Hospital Name:</span>{" "}
  //             {profile?.name}
  //           </div>
  //           <div>
  //             <span className="font-semibold">Address:</span> {profile?.address}
  //           </div>
  //           <div>
  //             <span className="font-semibold">Email:</span> {profile?.email}
  //           </div>

  //           <div className="mt-12 flex w-full justify-center gap-x-4"></div>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }
  return (
    <div className="flex flex-col gap-y-6">
      {isFetchingDetails && <Loader />}
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
        </div>
      </div>
    </div>
  );
}

export default HealthWorkerProfileTab;

