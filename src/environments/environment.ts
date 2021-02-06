// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  // firebase: {
  //   apiKey: 'AIzaSyCMyssj_kivllhOY_1SWZFbrmqAnzRoOwc',
  //   projectId: 'challenge-app-test',
  //   databaseURL: 'https://challenge-app-test.firebaseio.com/'
  // }
  firebaseConfig: {
    apiKey: 'AIzaSyCP-0nbBeapzRpnzw_aOmMRLbXfXR9UYLg',
    authDomain: 'challenge-app-test.firebaseapp.com',
    databaseURL: 'https://challenge-app-test.firebaseio.com',
    projectId: 'challenge-app-test',
    storageBucket: 'challenge-app-test.appspot.com',
    messagingSenderId: '537939683653',
    appId: '1:537939683653:web:89a75deeee56fdeddbb62c',
    measurementId: 'G-5XQSMXGDK8'
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
