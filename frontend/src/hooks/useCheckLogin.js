import { useMutation } from "@tanstack/react-query";

/**
 * AUTHENTICATION DISABLED - LOGIN HOOK DISABLED
 * This hook has been modified to disable login functionality while maintaining API compatibility
 */

const useCheckLogin = () => {
  // Return a disabled mutation that always succeeds without doing anything
  return useMutation({
    mutationFn: async (credentials) => {
      // Authentication disabled - return mock success response
      console.log("Login disabled - authentication bypassed");
      return {
        success: true,
        message: "Authentication disabled - access granted",
        user: null
      };
    },
    onSuccess: (data) => {
      // Authentication disabled - no actual login processing
      console.log("Login hook called but authentication is disabled");
    },
    onError: (error) => {
      // Authentication disabled - should not reach here
      console.log("Login error handler called but authentication is disabled");
    }
  });
};

export default useCheckLogin;