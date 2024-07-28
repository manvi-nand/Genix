# Genix-Auctions-Website

PROBLEM STATEMENT: 
Genix is a biding and auction platform here users can register, login, place bids on items and manage their auctions.

## Getting Started

1. Run the following command to install all the dependencies
```
npm install
```
2. Now, you should be able to see the node modules folder with all dependencies installed.
3. Install the mongodb community edition 
4. Ensure that mongo service has started and is listening on port 27017 and also ensure that MongoDB in your device don't have any database in the name of 'spidertask3'.
5. Now, run the following command back in the terminal at the project folder
```
   npm run dev
```
6. Navigate to http://localhost:3001 and you should be able to view main page


## Technology Used

FRONT-END
1. HTML
2. CSS
3. Javascript
4. Embedded Javascript
5. BootStrap

BACK-END
1. NodeJS
2. ExpressJS
3. MongoDB


## Schemas
1. Bids
2. Products 
3. Users


## Functionalities
1. Users can easily sign up, log in, and manage their auction activities.
2. Users can create, view, update, and delete auction items.
3. Users can participate in auctions by placing and tracking bids.
4. Includes search and filtering options for auction items 
5. Shows detailed information about the auction item.
6. Allows users to manage their information
7. Displays bid history
8. Display a list of auction items with their current highest bids.
9. Displays user's auction items and bids.
10. Provides a form for placing bids and adding new products



## Data Flow
   **Routes**

1. authRoutes:

Registration:
Page: /register → Submit Form → Server Checks Username → Save User or Error → Redirect to /login

Login:
Page: /login → Submit Form → Server Checks Credentials → Set Session or Error → Redirect to /dashboard

Logout:
Page: /logout → Destroy Session → Redirect to /dashboard


2. userRoutes:

Viewing User Profile:
Page: /me/profile → Fetch Current User Data → Render Profile View (userViews/profile) or Error → Redirect to /dashboard

Displaying Products in Alphabetical Order on Dashboard:
Page: /dashboard/alpha → Fetch and Sort Products → Render Dashboard View(productViews/dashboard) or Error → Redirect to /dashboard

Sorting Products:
Page: /sort → Determine Sort Option → Redirect to /dashboard(alpha) or /dashboard/alpha(higestBid)

Searching for Products:
Page: /search → Determine Search Option (by Tag or Name) → Fetch Products → Render Search Results View(productViews/tagsearch),(productViews/namesearch) or Error → Redirect to /dashboard


3. bidRoutes

Placing a Bid on a Product:
Page/Action: Click on bid button/link → URL Accessed: /product/:productid/bid/:userid → Check Authentication: checkAuth middleware → Fetch Data: Retrieve product and user data → Create Bid: Save new bid → Update Product: Save updated product with new bid and highest bid details → Set Flash Message: Success or error → Redirect: Back to the previous page or to the dashboard on error.


4. productRoute

Creating a Product: 
/newproduct → Submit Form → File Upload → Save Product → Redirect to Product Page

Viewing Dashboard: 
/dashboard → Fetch Products → Render Dashboard

Viewing Product: 
/product/:id/show → Fetch Product Data → Check Bid Status → Render Owner or User View

Updating Product: 
/product/:id/update → Fetch Product → Render Form → Submit Update → Save Changes → Redirect to Product Page

Deleting Product: 
/product/:id/delete → Fetch Product and Owner → Remove Product → Redirect to Dashboard

Ending Bid Early: 
/product/:id/endbid → Fetch Product → Set canBid to False → Save Changes → Redirect to Product Page


## Schema Documentation


     __________________________                                      _________ _____ _____ _                  
    |    User                 |                                     |      Bid                |
    |_________________________|                                     |_________________________|
    | Username(String)        |            One-to-many              | price(Number)           |
    | Password(String)        |          ------------->             |  owner[ref: User]       |
    | email(String)           |                                     |  product[ref: Product]  |
    | age(Number)             |                                     |_________________________|
    | gender(String)          |
    | products [ref:Product]  |                            
    |_________________________|
            |   
            |
            |   One-to-many                                                      ^ 
            |                                                                    |   
            V                                                                    |   
     __________________________                                                  |  
    |    Product              |                                                  |
    |_________________________|                                                  |
    | Name(String)            |                                                  |
    | Description(String)     |                                                  |
    | startPrice(String)      |                                                  |     
    | iamge(Number)           |                                                  |
    | owner [ref: User]       |                                                  |
    | highBidPrice(Nmber)     |                     One-to-many                  |
    | highestBid [ref: Bid]   |      ____________________________________________|
    | bids [ref: Bid]         |
    | canBid(boolean)         |
    | bidDeadline(Date)       |
    |                         |
    ___________________________







    git init - to initialize the repo
    git remote -v - to check the remote url 
    git remote set url - change the remote url 