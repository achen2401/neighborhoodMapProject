### Neighborhood Map Project

##About this site
A predetermine set of locations in Seattle is displayed on the Google Map.   Clicking on each marker on the map should display its location along with an information link that points to the Wikipedia article about this location
Clicking on each location listed in the view list will trigger the information window to pop open for the corresponding marker on the map

##API used for this project
Google Map API was used to create a map of a set of predefined locations in the Seattle neighborhood.
MediaWiki API to retrieve additional information about each location

##The site is interactive
Knockout JS framework is used for this project so that the DOM content of the html is populated using observables in Knockout.  Content of the site is therefore updated dynamically upon occurrence of an event, e.g. clicking on item in the viewList, filtering the viewList.

##The site is responsive
In additional to some css tricks, Twitter Boostrap CSS is used to help make this site responsive.  When the viewport size hits a certain breaking point (i.e. when the viewport cannot accomodate both the list view and the map), the side list view will disappear.  The hamburger menu icon should appear in the header bar - clicking on it will toggle the side list view.

##Information about running the site
Because Grunt is used to build the optimized code,i.e. minifying JS, the folder **dist** contains the code for final evaluation.  The **src** contains the source code.
To see the final optimized code in action, open index.html file in dist folder in browser.  Similarly, if the project is hosted on a webserver, make sure the url points to the index.html within the dist folder.
Running ```grunt``` at command line from within the root project folder will clean and rebuild the code within dist folder.
**NOTE** Before running ```grunt``` command, make sure to run ```npm install``` command as it will install each dependency plugin listed within **package.json** file.


