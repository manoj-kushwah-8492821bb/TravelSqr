import { NextResponse } from "next/server";

// This function can be marked `async` if using `await` inside

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;
  const userToken = request.cookies.get("userToken")?.value;
  //console.log(token);
  //console.log((!(pathname.includes("/paymentsuccess"))) || (!(pathname.includes("/paymentconfirm"))) || (!(pathname.includes("/payment"))));

  if (token != undefined) {
    if (!pathname.includes("/admin") || pathname == "/admin") {
      return NextResponse.redirect(new URL("/admin/db-dashboard", request.url));
    }
  } else if (userToken != undefined) {
    if ((!pathname.includes("/user")) || pathname == "/user" || pathname == "/user/signup" || pathname == "/user/otp-verify" || pathname == "forgot-password-otp-verify") {
      if( (!(pathname.includes("/paymentsuccess"))) && (!(pathname.includes("/paymentconfirm"))) && (!(pathname.includes("/payment"))) ){
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
  } else {
    if (
      !pathname.includes("/admin/verify-email/") &&
      pathname.includes("/admin") &&
      pathname != "/admin" &&
      pathname != "/admin/forgot-password"
    ) {
      return NextResponse.redirect(new URL("/admin", request.url));
    } else if (
      (pathname.includes("/user") &&
      pathname != "/user" &&
      pathname != "/user/signup" &&
      pathname != "/user/forgot-password" &&
      pathname != "/user/forgot-password-otp-verify" &&
      pathname != "/user/otp-verify") || 
      ( (pathname.includes("/paymentsuccess")) || (pathname.includes("/paymentconfirm")) || (pathname.includes("/payment")) )
    ) {
      return NextResponse.redirect(new URL("/user", request.url));
    }
  }
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/admin/:path*", "/user/:path*","/paymentsuccess","/paymentconfirm","/payment"],
};
