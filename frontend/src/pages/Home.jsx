import React from "react";
import { Typewriter } from "react-simple-typewriter";

// Using IPLC logo instead of old CureIt branding
// import BookSmartlyLogoWhite from "../assets/BookSmartlyLogoWhite.png";
// import cliniciansImage from "../assets/clinicians.png";
import { useBookSmartlyContext } from "../utils/ContextProvider";
import { Button } from "@radix-ui/themes";
import Features from "../components/Features";
import { useNavigate } from "react-router-dom";

function Home() {
  const { profile } = useBookSmartlyContext();

  const navigate = useNavigate();
  // Authentication disabled - no token check needed
  const token = null; // Always treat as no token since auth is disabled

  return (
    <div className="flex flex-col overflow-hidden font-noto">
      <div className="flex h-[100svh] animate-fade-up flex-col items-center justify-center py-32 md:justify-around lg:flex-row">
        <div className="absolute top-0 -z-10">
          <svg
            width="2560"
            height="1920"
            viewBox="0 0 2560 1920"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              opacity: 0.5,
              "--color-background-image-base": "var(--color-background)",
              "--color-background-image-accent-1": "var(--indigo-a7)",
              "--color-background-image-accent-2": "var(--violet-6)",
              "--color-background-image-accent-3": "var(--purple-9)",
              "--color-background-image-accent-4": "var(--blue-5)",
              "--color-background-image-accent-5": "var(--slate-1)",
              "--color-background-image-accent-6": "var(--crimson-a5)",
              "--color-background-image-accent-7": "var(--indigo-5)",
            }}
          >
            <g>
              <path
                d="M3020.93 134.455C3124.79 173.824 3164.97 266.778 3110.66 342.074C2627.55 1011.9 1866.31 2517.63 1361.75 2752.01C-681.389 3429.21 -4156.79 2571.47 -2138.3 1425.38C-119.809 279.282 -1553.39 -218.348 -406.211 -990.94C930.008 -1890.85 2560.5 -40.0647 3020.93 134.455Z"
                fill="url(#paint0_radial_37_453-1)"
              ></path>
              <path
                d="M885.9 -99.2149L1864.74 271.797C1921.14 293.178 1961.34 331.784 1974.23 376.971L2135.2 941.153L2866.18 715.05C2924.72 696.941 2991.39 698.838 3047.8 720.218L4026.64 1091.23C4130.5 1130.6 4170.68 1223.55 4116.37 1298.85L3855.77 1660.16C3833.07 1691.63 3796.05 1716.44 3750.99 1730.38L2473.16 2125.63L2754.29 3110.94C2764.38 3146.29 2756.99 3183.09 2733.43 3214.9L2367.46 3708.79L1208.97 3269.68C1152.56 3248.3 1112.37 3209.7 1099.48 3164.51C816.824 2173.87 718.627 2080.16 290.681 580.294C250.811 440.558 316.198 358.62 338.898 327.148L599.499 -34.1638C653.807 -109.46 782.033 -138.584 885.9 -99.2149Z"
                fill="url(#paint1_radial_37_453-1)"
              ></path>
              <path
                d="M1597.13 169.785L2575.97 540.797C2632.38 562.177 2672.57 600.783 2685.46 645.97L2846.44 1210.15L3577.41 984.05C3635.96 965.94 3702.63 967.838 3759.03 989.218L4737.87 1360.23C4841.74 1399.6 4881.91 1492.55 4827.6 1567.85L4567 1929.16C4544.3 1960.63 4507.28 1985.44 4462.22 1999.38L3184.4 2394.63L3465.53 3379.94C3475.61 3415.29 3468.23 3452.09 3444.66 3483.9L3078.69 3977.79L1920.2 3538.68C1863.79 3517.3 1823.6 3478.7 1810.71 3433.51L1649.74 2869.33L918.759 3095.43C860.213 3113.54 793.545 3111.64 737.138 3090.26C737.138 3090.26 -278.857 2706.76 -70.6873 2151.46C137.482 1596.17 725.315 1866.25 1311.78 1684.85L1030.38 698.594C1020.45 663.816 1027.43 627.62 1050.13 596.148L1310.73 234.836C1365.04 159.54 1493.27 130.416 1597.13 169.785Z"
                fill="url(#paint2_radial_37_453-1)"
              ></path>
              <path
                d="M646.599 3987.93L-98.3711 1153.81L4970.66 -538.566L8169.17 3987.93H646.599Z"
                fill="url(#paint3_radial_114_43-1)"
              ></path>
              <path
                d="M793.654 3742.84L48.6836 908.72L5117.71 -783.656L8316.22 3742.84H793.654Z"
                fill="url(#paint4_radial_114_43-1)"
              ></path>
              <ellipse
                cx="2396.98"
                cy="275.232"
                rx="1699.15"
                ry="1558.77"
                fill="url(#paint5_radial_114_43-1)"
              ></ellipse>
              <path
                opacity="0.5"
                d="M6290.25 3071.54L3745.51 4524.66L283.022 -523.642L4343.26 -4194.7L6290.25 3071.54Z"
                fill="url(#paint6_radial_114_43-1)"
              ></path>
              <path
                d="M3059.26 767.931C3338.11 1712.5 3585.77 2551.43 3864.61 3496C3891.25 3586.22 3837.42 3706.98 3744.38 3765.74C2803.8 4359.68 -787.932 5319.23 63.3068 2765.51C176.75 2425.18 313.694 2187.12 594.28 2175.25C874.865 2163.39 1279.76 2345.45 1646.71 2313.32C2175.9 2266.99 2044.14 1215.13 2396.11 992.875L2842.57 710.952C2935.61 652.201 3032.62 677.711 3059.26 767.931Z"
                fill="url(#paint4_radial_37_453-1)"
              ></path>
            </g>
            <defs>
              <radialGradient
                id="paint3_radial_114_43-1"
                cx="0"
                cy="0"
                r="1"
                gradientUnits="userSpaceOnUse"
                gradientTransform="translate(2922 2538.48) rotate(-117.986) scale(1898.15 3571.73)"
              >
                <stop stop-color="var(--color-background-image-base)"></stop>
                <stop
                  offset="0.822917"
                  stop-color="var(--color-background-image-base)"
                ></stop>
                <stop
                  offset="1"
                  stop-color="var(--color-background-image-base)"
                  stop-opacity="0"
                ></stop>
              </radialGradient>
              <radialGradient
                id="paint4_radial_114_43-1"
                cx="0"
                cy="0"
                r="1"
                gradientUnits="userSpaceOnUse"
                gradientTransform="translate(3069.05 2293.39) rotate(-117.986) scale(1898.15 3571.73)"
              >
                <stop stop-color="var(--color-background-image-base)"></stop>
                <stop
                  offset="0.822917"
                  stop-color="var(--color-background-image-base)"
                ></stop>
                <stop
                  offset="1"
                  stop-color="var(--color-background-image-base)"
                  stop-opacity="0"
                ></stop>
              </radialGradient>
              <radialGradient
                id="paint5_radial_114_43-1"
                cx="0"
                cy="0"
                r="1"
                gradientUnits="userSpaceOnUse"
                gradientTransform="translate(2994.87 275.232) rotate(118.839) scale(1779.46 2065.6)"
              >
                <stop
                  offset="0.328125"
                  stop-color="var(--color-background-image-accent-1)"
                  stop-opacity="1"
                ></stop>
                <stop offset="1" stop-color="white" stop-opacity="0"></stop>
              </radialGradient>
              <radialGradient
                id="paint6_radial_114_43-1"
                cx="0"
                cy="0"
                r="1"
                gradientUnits="userSpaceOnUse"
                gradientTransform="translate(3934.59 656.035) rotate(148.98) scale(1938.73 3648.08)"
              >
                <stop stop-color="var(--color-background-image-base)"></stop>
                <stop
                  offset="0.789375"
                  stop-color="var(--color-background-image-base)"
                ></stop>
                <stop
                  offset="1"
                  stop-color="var(--color-background-image-base)"
                  stop-opacity="0"
                ></stop>
              </radialGradient>
              <radialGradient
                id="paint0_radial_37_453-1"
                cx="0"
                cy="0"
                r="1"
                gradientUnits="userSpaceOnUse"
                gradientTransform="translate(-804.109 -2036.8) rotate(64.9401) scale(6436.87 6304.81)"
              >
                <stop stop-color="var(--color-background-image-base)"></stop>
                <stop
                  offset="0.0833333"
                  stop-color="var(--color-background-image-accent-1)"
                ></stop>
                <stop
                  offset="0.364583"
                  stop-color="var(--color-background-image-accent-2)"
                ></stop>
                <stop
                  offset="0.658041"
                  stop-color="var(--color-background-image-base)"
                ></stop>
                <stop
                  offset="0.798521"
                  stop-color="var(--color-background-image-accent-3)"
                ></stop>
                <stop
                  offset="0.942708"
                  stop-color="var(--color-background-image-base)"
                ></stop>
                <stop
                  offset="1"
                  stop-color="var(--color-background-image-base)"
                ></stop>
              </radialGradient>
              <radialGradient
                id="paint1_radial_37_453-1"
                cx="0"
                cy="0"
                r="1"
                gradientUnits="userSpaceOnUse"
                gradientTransform="translate(201.6 -1080.02) rotate(64.9401) scale(6436.87 6304.81)"
              >
                <stop stop-color="var(--color-background-image-base)"></stop>
                <stop
                  offset="0.0833333"
                  stop-color="var(--color-background-image-accent-4)"
                ></stop>
                <stop
                  offset="0.333803"
                  stop-color="var(--color-background-image-accent-5)"
                ></stop>
                <stop
                  offset="0.658041"
                  stop-color="var(--color-background-image-base)"
                ></stop>
                <stop
                  offset="0.798521"
                  stop-color="var(--color-background-image-accent-3)"
                ></stop>
                <stop
                  offset="0.942708"
                  stop-color="var(--color-background-image-base)"
                ></stop>
                <stop
                  offset="1"
                  stop-color="var(--color-background-image-base)"
                ></stop>
              </radialGradient>
              <radialGradient
                id="paint2_radial_37_453-1"
                cx="0"
                cy="0"
                r="1"
                gradientUnits="userSpaceOnUse"
                gradientTransform="translate(912.834 -811.021) rotate(64.9401) scale(6436.87 6304.81)"
              >
                <stop stop-color="var(--color-background-image-base)"></stop>
                <stop
                  offset="0.140625"
                  stop-color="var(--color-background-image-accent-6)"
                  stop-opacity="0"
                ></stop>
                <stop
                  offset="0.333803"
                  stop-color="var(--color-background-image-accent-7)"
                ></stop>
                <stop
                  offset="0.658041"
                  stop-color="var(--color-background-image-base)"
                ></stop>
                <stop
                  offset="0.798521"
                  stop-color="var(--color-background-image-accent-3)"
                ></stop>
                <stop
                  offset="0.942708"
                  stop-color="var(--color-background-image-base)"
                ></stop>
                <stop
                  offset="1"
                  stop-color="var(--color-background-image-base)"
                ></stop>
              </radialGradient>
              <radialGradient
                id="paint3_radial_37_453-1"
                cx="0"
                cy="0"
                r="1"
                gradientUnits="userSpaceOnUse"
                gradientTransform="translate(1711.41 -1639.11) rotate(64.9401) scale(6436.87 6304.81)"
              >
                <stop stop-color="var(--color-background-image-base)"></stop>
                <stop
                  offset="0.0833333"
                  stop-color="var(--color-background-image-accent-1)"
                ></stop>
                <stop
                  offset="0.333803"
                  stop-color="var(--color-background-image-accent-5)"
                ></stop>
                <stop
                  offset="0.658041"
                  stop-color="var(--color-background-image-base)"
                ></stop>
                <stop
                  offset="0.798521"
                  stop-color="var(--color-background-image-accent-3)"
                ></stop>
                <stop
                  offset="0.942708"
                  stop-color="var(--color-background-image-base)"
                ></stop>
                <stop
                  offset="1"
                  stop-color="var(--color-background-image-base)"
                ></stop>
              </radialGradient>
              <radialGradient
                id="paint4_radial_37_453-1"
                cx="0"
                cy="0"
                r="1"
                gradientUnits="userSpaceOnUse"
                gradientTransform="translate(3479.06 -623.459) rotate(113.028) scale(8332.26 4870.62)"
              >
                <stop stop-color="var(--color-background-image-base)"></stop>
                <stop
                  offset="0.0833333"
                  stop-color="var(--color-background-image-accent-1)"
                ></stop>
                <stop
                  offset="0.333803"
                  stop-color="var(--color-background-image-accent-5)"
                ></stop>
                <stop
                  offset="0.658041"
                  stop-color="var(--color-background-image-base)"
                ></stop>
                <stop
                  offset="0.798521"
                  stop-color="var(--color-background-image-accent-3)"
                ></stop>
                <stop
                  offset="0.942708"
                  stop-color="var(--color-background-image-base)"
                ></stop>
                <stop
                  offset="1"
                  stop-color="var(--color-background-image-base)"
                ></stop>
              </radialGradient>
            </defs>
          </svg>
        </div>

        <div className="flex flex-col items-center justify-center p-8">
          <img
            src="/iplclogo.png"
            alt="IPLC BookSmartly Logo"
            className="h-20 md:h-28 lg:h-32"
          />
          <div class="my-4 h-[1px] w-full bg-gradient-to-r from-transparent via-[#79797949] to-transparent"></div>
          <p className="h-7 w-96 text-center font-medium tracking-wider">
            <Typewriter
              loop={true}
              deleteSpeed={20}
              typeSpeed={50}
              delaySpeed={2000}
              words={["Welcome to BookSmartly.", "Appointment Booking made easy!"]}
              cursor={true}
            />
          </p>
          <div className="mt-12 flex w-full justify-center gap-x-4">
            {/* Authentication disabled - always show Sign Up button */}
            <Button
              color="iris"
              size="3"
              variant="soft"
              className="my-4"
              onClick={() => navigate("/signup")}
            >
              Sign Up
            </Button>
            {profile?.role !== "clinician" && (
              <Button
                color="iris"
                size="3"
                variant=""
                className="my-4"
                onClick={() => {
                  // Authentication disabled - always navigate to book appointment
                  navigate("/bookappointment");
                }}
              >
                Book Appointment
              </Button>
            )}
          </div>
        </div>
        <div className="relative">
          <img
            src="/BookSmartly_hero_image.png"
            alt="BookSmartly Hero"
            className="h-80 object-cover md:h-96 lg:h-[32rem] xl:h-[36rem]"
          />
          {/* <div className="gradient left-10 top-[-90px] opacity-50"></div> */}
        </div>
      </div>
      <Features />
    </div>
  );
}

export default Home;

// import React, { useEffect, useState } from "react";
// import { Typewriter } from "react-simple-typewriter";
// import BookSmartlyLogoWhite from "../assets/BookSmartlyLogoWhite.png";
// import cliniciansImage from "../assets/clinicians.png";
// import { useBookSmartlyContext, useAuthContext } from "../utils/ContextProvider";
// import { Button } from "@radix-ui/themes";
// import Features from "../components/Features";
// import { useNavigate } from "react-router-dom";
// import { supabase } from "../utils/supabaseClient";
// import ChatBot from "../components/ChatBot/ChatBot";

// function Home() {
//   const { theme, profile } = useBookSmartlyContext();

//   const navigate = useNavigate();
//   const token = localStorage.getItem("sb-itbxttkivivyeqnduxjb-auth-token");
//   const userData = token;
//   const [userInfo, setUserInfo] = useState({
//     id: "",
//     name: "",
//     email: "",
//     phone: "",
//     role: " ",
//     confirmed_at: "",
//     last_sign_in_at: "",
//     phone: "",
//   });

//   return (
//     <div className="flex flex-col overflow-hidden font-noto">
//       <div className="flex h-[100svh] animate-fade-up flex-col items-center justify-center py-32 md:justify-around lg:flex-row">
//         <div className="absolute top-0 -z-10">
//           {/* Background SVG code */}
//           <svg
//             width="2560"
//             height="1920"
//             viewBox="0 0 2560 1920"
//             fill="none"
//             xmlns="http://www.w3.org/2000/svg"
//             style={{
//               opacity: 0.5,
//               "--color-background-image-base": "var(--color-background)",
//               "--color-background-image-accent-1": "var(--indigo-a7)",
//               "--color-background-image-accent-2": "var(--violet-6)",
//               "--color-background-image-accent-3": "var(--purple-9)",
//               "--color-background-image-accent-4": "var(--blue-5)",
//               "--color-background-image-accent-5": "var(--slate-1)",
//               "--color-background-image-accent-6": "var(--crimson-a5)",
//               "--color-background-image-accent-7": "var(--indigo-5)",
//             }}
//           >
//             {/* SVG path elements remain unchanged */}
//           </svg>
//         </div>

//         <div className="flex flex-col items-center justify-center p-8">
//           <img
//             src={BookSmartlyLogoWhite}
//             alt="BookSmartly Logo"
//             className="h-20 md:h-28 lg:h-32"
//           />
//           <div className="my-4 h-[1px] w-full bg-gradient-to-r from-transparent via-[#79797949] to-transparent"></div>
//           <p className="h-7 w-96 text-center font-medium tracking-wider">
//             <Typewriter
//               loop={true}
//               deleteSpeed={20}
//               typeSpeed={50}
//               delaySpeed={2000}
//               words={["Welcome to BookSmartly.", "Appointment Booking made easy!"]}
//               cursor={true}
//             />
//           </p>
//           <div className="mt-12 flex w-full justify-center gap-x-4">
//             {token ? (
//               <Button
//                 color="iris"
//                 size="3"
//                 variant="soft"
//                 className="my-4"
//                 onClick={() => navigate("/user/dashboard")}
//               >
//                 Dashboard
//               </Button>
//             ) : (
//               <Button
//                 color="iris"
//                 size="3"
//                 variant="soft"
//                 className="my-4"
//                 onClick={() => navigate("/signup")}
//               >
//                 Sign Up
//               </Button>
//             )}
//             {profile?.role !== "clinician" && (
//               <Button
//                 color="iris"
//                 size="3"
//                 variant=""
//                 className="my-4"
//                 onClick={() => {
//                   if (token) {
//                     navigate("/bookappointment");
//                   } else {
//                     navigate("/login");
//                   }
//                 }}
//               >
//                 Book Appointment
//               </Button>
//             )}

//             {/* Free Health Checkup Camp Button */}
//             <Button
//               color="green"
//               size="3"
//               variant="soft"
//               className="my-4"
//               onClick={() => navigate("/health-camps")}
//             >
//               Free Health Camps
//             </Button>
//           </div>
//         </div>

//         <div className="relative">
//           <img
//             src={cliniciansImage}
//             alt="clinicians"
//             className="h-64 object-cover md:h-72 lg:h-96"
//           />
//         </div>
//       </div>
//       <Features />
//     </div>
//   );
// }

// export default Home;
