# f1-friend


Formula1 -friend - a single page web application for Formula 1 fanatics to keep track of the race schedule and get insightful details on race weekend they missed. It makes use of data provided from Ergast Developer API’s to display the data.

# Schedule
![schedule](https://github.com/rishii7/f1-friend/blob/master/images/schedule.png "Schedule")

# Lapcharts
![lapcharts](https://github.com/rishii7/f1-friend/blob/master/images/lapcharts.png "Lapcharts")

# Backend

The backend of this application is built with NodeJS/Express. All the packages used in developing the backend can be found in `package.json` under project directory.

# Frontend

Frontend of the application is built with Angular Material for the user interface with Angular JS as the front-end framework. In order to implement the maps and charts this application makes use of Angular’s directive components. The Map of schedule is implemented with Am Charts library and the lap charts is implemented with d3.js.Both of these libraries are used to implement the directives of the application.

# Ergast developer API's 

[Ergast developer API’s](https://ergast.com/mrd/) are used in this application through a wrapper npm package - Ergast-client. This application makes use of these API’s as needed.

# Working

The server exposes two REST API’s to client. These API’s internally fetch data from Ergast and parse them so that the client can consume them. The two API’s are /season and /getLapChartData. The season API takes a single argument ‘seasonid’ and the getLapChartData API takes two arguments `seasonid` and `round’. These API’s are used to generate data for race schedule map and race lap charts respectively.
The client makes use of the API’s by passing the request parameters as expected by these API’s.

# Interface

The interface of the application is built with Angular Material. The interface is divided into two parts using Angular Material’s `md-sidenav` component. This component divides the page into two vertically. 
The leftmost part of the page divided sub- menus -  Season Schedule and Lap Chart. Where each sub-menu has a list of `years` for which the data has to displayed.
The Map schedule /Lap chart is displayed on the right side of sidenav based on the year selected from the user. Schedule Map displays the race schedule by animating the race locations on world map and providing the links to race circuit and location at the bottom of the page. 
Lap chart draws a comparison between positions of each race driver during each lap of the race. The lap chart can be seen by selecting a year from Lap chart sub-menu and then selecting the round number from right hand corner of the page. The legends of the Lap chart can be used to infer details from the lap chart. 


# Libraries
Libraries used - Client end makes use of Angular Material, AngularJS web framework AmCharts and lap chart component is implemented with code from data analyst -  [Chris Pudney](http://www.vislives.com/2012/03/d3-lap-charts.html). The backend makes use of several npm packages to accomplish general tasks of server, in addition to this it also makes use of [Ergast client](https://github.com/davidor/ergast-client-nodejs) npm package as a wrapper to fetch data from Ergast.

# Acknowledgement
  Chris Pudney - http://www.vislives.com/2012/03/d3-lap-charts.html
  David Ortiz - https://github.com/davidor/ergast-client-nodejs

# LICENSE
See Licencense file.
