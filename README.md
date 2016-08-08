# AngularJS simple app

This is AngularJS application. Because it uses ng-include directives for “SIGN IN” and “SIGN UP” views it should be run on web server (local or remote) or, if it's possible, configure browser to allow local files access.

In this test work I used:
- HTML5
- CSS3
- Materialize CSS framework (http://materializecss.com/) to use build in components for design purposes and grid system to make application design responsive. So it looks good on mobile, tablet and desktop
- AngularJS MVC framework
- jQuery (a little bit)
- AJAX
- JSON

Main AngularJS module is in app.js. There are three controllers. Main controller is in app.js file, other two controllers for “SIGN IN” and “SIGN UP” inherit from it and located in signIn/signInCtrl.js and signUp/signUpCtrl.js. All code is accompanied with comments. In GET /api/products/ query "img" field contains text instead of encoded image, so I displayed it by putting this text in alt attribute of <img> tag, but the image container is ready for any image size. I provided success and error handling for AJAX requests, so you can see messages appearing. Also I made form validation (for required fields and password matching) in "SIGN IN", "SIGN UP" and "REVIEWS".

Total time: 26 hours.
