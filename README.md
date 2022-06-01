# PH-Favorited-Gif-Downloader
Don't ask why, just know it happened.

😜 What is it? : Well, if you favorite gifs on PH, and don't feel like manually downloading all of them, this is a fairly good tool to do the job for you.

Everything started out with a simple sketch

> PH Gifs downloading 
> sending a GET request to user profile, ex. https://www.pornhub.com/users/xxxxxx/gifs/favorites?page=1
> will show a list of gifs, not all of the favorited gifs but a decent sized list (52 to be exact)

> there is then a *div* titled moreData and inside are *li*'s with an id="gifXXXXXXXXXX" the number following gif is the gif ID
> inside the *li* is a link *a* and inside that there is an image with a source (src) that source will have a string something like /gifs/XXX/XXX/XXX those numbers are needed in order to generate the full webm link

> webm's are titled like so

> https://dl.phncdn.com/pics/gifs/XXX/XXX/XXX/XXXXXXXXa.webm
> ^                ^        ^
> base url        number after /gifs    gif ID

> using this you can use the get request and take all the given links 
> the gif ID seems to always be followed by the letter a 

> so use web scraper to get number after /gifs, the gif ID, and then rebuild the link and store it in an array
> then use array to download files onto computer via http request and filestream.

📄 So with this sketch I figured out how webm's were stored, how the website you see interfaces with said storage, and how to get from front facing website to a full list of every single gif you've ever favorited on the platform at your finger tips.

📄 Now why did I do this? As a challenge to see if I could extrapolate data from a website and make something useful out of it. Similar to how a streetwear bot or monitor would work in the sense of sending a http request to a website
and then using a web scraping tool to make sense out of all the data.

📄 There's some other things I would like to add to the tool like saving the webm's to a folder, and creating a log of the gif ID's so if someone moves the webm's out of the folder it won't see them missing and decide to redownload the same webm.
