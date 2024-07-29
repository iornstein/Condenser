## About

This is a version 3 google chrome plugin to help minimize my distractions. Theoretically, you can use it too. Simply download this repo into a single folder, and [follow these instructions](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked)

The name "condenser" comes from a "condenser lens" as this is a focusing tool.

The current version is hyper-tailored to me. I may, in the future, make this more customizable and public-ready.


##Future Work
Right now, the plugin works perfect for my uses cases. However, for the experience (ie joy of coding) I may iterate further on the plugin. I have an idea of a potential version 1.5 that is released as a downloadable plugin. A rough plan follows:

##### Version 1.1 - 1.2
- [ ] The js files are a mess and poorly named. I need to make sensible break downs of the js files and do some refactors like:
    * Switch to returning promises everywhere rather than having tasks as parameters
    * come up with better file name/separation for js functions
- [ ] Standardize the reddit and youtube html pages (IN PROGRESS)
- [x] Add in facebook to be blocked just like reddit is
- [ ] Make the web pages cleaner and prettier
- [ ] Add some testing in
- [ ] Consider a popup after the time expires.
- [ ] Consider saving the current url when said time expires.
- [ ] Identify a more limited set of permissions
- [ ] What happens when you visit the pages when the website is NOT blocked?
- [ ] guard.js seems to need some love. I don't like the multiple if/else statements.

##### Version 1.3
- [ ] Genericize the reddit redirect. Have no more explicit mentions of reddit

##### Version 1.4
- [ ] Genericize the timed youtube redirect. Have no more explicit mentions of youtube

##### Version 1.5
- [ ] Research what it takes to deploy a plugin to app store
- [ ] Create a Pipeline to deploy to app store?

##### Version Beyond
- [ ] Make it work if you switch tabs etc (ie scope the desired urls by blocked domains)





