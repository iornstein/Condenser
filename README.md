## About

This is a version 3 google chrome plugin to help minimize my distractions. Theoretically, you can use it too. Simply download this repo into a single folder, and [follow these instructions](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked)

The name "condenser" comes from a "condenser lens" as this is a focusing tool.

The current version is hyper-tailored to me. I may, in the future, make this more customizable and public-ready.

## Future Work
Right now, the plugin works perfect for my uses cases. However, for the experience (ie joy of coding) I may iterate further on the plugin. I have an idea of a potential version 1.6 that is released as a downloadable plugin. A rough plan follows:

##### Version 1.1
- [x] Fix timer bug -- I cannot reproduce this bug. It may have been fixed with the refactors.
- [x] Switch to typescript
- [x] Use more powerful typing throughout the project
- [x] Add in facebook to be blocked just like reddit is
- [x] Add in script to bump version

##### Version 1.2
- [x] Genericize the timed youtube redirect. Have no more explicit mentions of youtube scattered throughout. Allow dynamic creation of redirect pages from one source

##### Version 1.3
- [x] Make reddit time based as well
- [x] Make chess.com time based blocked
- [x] Add initial tests
- [x] Do better validation of default blocked websites, specifically URL. Report errors better
- [x] Handle id generation on behalf of users?
- [x] See if a multi remove is actually necessary when finding duplicate rules

##### Version 1.4
- [x] Switch to messages and timeout rather than waiting on web requests to block
- [ ] The js files are a mess and poorly named. I need to make sensible break downs of the js files and do some refactors like:
    * [x] Switch to returning promises everywhere rather than having tasks as parameters
    * [ ] come up with better file name/separation for js functions
    * [ ] Split up helpers.ts
- [ ] Make the web pages cleaner and prettier
- [ ] Unit test everything
- [ ] Consider a popup after the time expires.
- [ ] Consider saving the current url when said time expires.
- [x] Identify a more limited set of permissions
- [ ] Remove webNavigation permission? I was using this before for to store desiredURL, depending on popup 
      implementation I can remove this permission
- [ ] Handle the "website is blocked" rather than redirecting bug: perhaps look at [this link](https://stackoverflow.com/questions/38428586/open-chrome-extension-in-html)
- [ ] Duplicate rule Id bug resurfaced
- [x] Solve incorrect redirect bugs

##### Version 1.5
- [ ] Research what it takes to deploy a plugin to app store
- [ ] Create a Pipeline to deploy to app store?
- [ ] Integration Tests

##### Version Beyond
- [ ] Make it work if you switch tabs etc (ie scope the desired urls by blocked domains)

##### Other queries
- It doesn't seem to work on button redirects? Or something. For example, if youtube/shorts is blocked and you go youtub
 and click on a short, it is not blocked. But directly going to youtube shorts IS blocked





