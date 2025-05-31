import BookSmartlyLogo from "../assets/BookSmartlyLogo";
import BookSmartlyLogoWhite from "../assets/BookSmartlyLogoWhite.png";

function BookingProcessGuide() {
  return (
    <div className="animate-fade-up">
      <div className="my-2 flex w-full justify-center">
        <img src={BookSmartlyLogoWhite} alt="" className="h-12 md:h-16 w-auto" />
      </div>
      <div className="mb-4 flex select-none justify-center text-center font-noto text-base font-semibold md:text-lg">
        Welcome to CureIt Appointment Booking
      </div>

      <div className="flex flex-col gap-y-4 font-noto">
        <p>
          At CureIt, we make booking appointments simple, quick, and
          hassle-free!
        </p>
        <ol className="ml-4 flex list-inside list-decimal flex-col gap-y-1">
          <li>
            <b>Fill Your Details</b> - Provide your basic information to help us
            serve you better.
          </li>
          <li>
            <b>Choose a Time Slot</b> - Select a convenient date and time from
            the available options.
          </li>
          <li>
            <b>Review and Confirm</b> - Double-check your details and confirm
            your booking.
          </li>
        </ol>
        <p className=" ">
          Our goal is to ensure a smooth experience and minimize your wait time.
          You're just a few steps away from booking your appointment. <br />{" "}
          Click <b>Next</b> to get started and enter your personal details.
        </p>
      </div>
    </div>
  );
}

export default BookingProcessGuide;
