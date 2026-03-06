// Add this to your project to resolve the module missing error for react-razorpay
declare module 'react-razorpay' {
    const useRazorpay: () => readonly [any];
    export default useRazorpay;
}
