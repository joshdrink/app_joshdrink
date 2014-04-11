/*globals casper, __utils__, url, testPost */

CasperTest.begin("Content screen is correct", 12, function suite(test) {
    // Create a sample post
    casper.thenOpen(url + 'ghost/editor/', function testTitleAndUrl() {
        test.assertTitle('Ghost Admin', 'Ghost admin has no title');
    });

    casper.then(function createTestPost() {
        casper.sendKeys('#entry-title', testPost.title);
        casper.writeContentToCodeMirror(testPost.html);
    });

    casper.waitForSelectorTextChange('.entry-preview .rendered-markdown', function onSuccess() {
        test.assertSelectorHasText('.entry-preview .rendered-markdown', 'test', 'Editor value is correct');
    });

    casper.thenClick('.js-publish-button');

    casper.waitForResource(/posts\/$/, function checkPostWasCreated() {
        test.assertExists('.notification-success', 'got success notification');
    });

    // Begin test
    casper.thenOpen(url + "ghost/content/", function testTitleAndUrl() {
        test.assertTitle("Ghost Admin", "Ghost admin has no title");
        test.assertUrlMatch(/ghost\/content\/$/, "Ghost doesn't require login this time");
    });

    casper.then(function testViews() {
        test.assertExists(".content-view-container", "Content main view is present");
        test.assertExists(".content-list-content", "Content list view is present");
        test.assertExists(".content-list-content li .entry-title", "Content list view has at least one item");
        test.assertExists(".content-preview", "Content preview is present");
        test.assertSelectorHasText(".content-list-content li:first-child h3", testPost.title, "item is present and has content");
    });

    casper.then(function testActiveItem() {
        test.assertEvalEquals(function () {
            return document.querySelector('.content-list-content li').className;
        }, "active", "first item is active");

    }).thenClick(".content-list-content li:nth-child(2) a", function then() {
        test.assertEvalEquals(function () {
            return document.querySelectorAll('.content-list-content li')[1].className;
        }, "active", "second item is active");
    });
});

CasperTest.begin('Infinite scrolling', 1, function suite(test) {
    // Placeholder for infinite scrolling/pagination tests (will need to setup 16+ posts).

    casper.thenOpen(url + 'ghost/content/', function testTitleAndUrl() {
        test.assertTitle('Ghost Admin', 'Ghost admin has no title');
    });
});

CasperTest.begin("Posts can be marked as featured", 12, function suite(test) {
    // Create a sample post
    casper.thenOpen(url + 'ghost/editor/', function testTitleAndUrl() {
        test.assertTitle('Ghost Admin', 'Ghost admin has no title');
    });

    casper.then(function createTestPost() {
        casper.sendKeys('#entry-title', testPost.title);
        casper.writeContentToCodeMirror(testPost.html);
    });

    casper.thenClick('.js-publish-button');

    casper.waitForSelector('.notification-success', function waitForSuccess() {
        test.assert(true, 'got success notification');
        test.assertSelectorHasText('.notification-success', 'Your post has been saved as a draft.');
    }, function onTimeout() {
        test.assert(false, 'No success notification :(');
    });

    // Begin test
    casper.thenOpen(url + "ghost/content/", function testTitleAndUrl() {
        test.assertTitle("Ghost Admin", "Ghost admin has no title");
    });

    // Mark as featured
    casper.waitForSelector('.content-preview .unfeatured', function () {
        this.click('.content-preview .unfeatured');
    }, function onTimeOut() {
        test.assert(false, 'The first post can\'t be marked as featured');
    });

    casper.waitForSelector('.notification-success', function waitForSuccess() {
        test.assert(true, 'got success notification');
        test.assertSelectorHasText('.notification-success', 'Post successfully marked as featured.');
    }, function onTimeout() {
        test.assert(false, 'No success notification :(');
    });

    casper.waitForSelector('.content-list-content li:first-child .featured', function () {
        test.assertExists('.content-preview .featured');
        test.assert(true, 'got a featured star');
        this.click('.notification-success .close');
    }, function onTimeout() {
        test.assert(false, 'No featured star appeard in the left pane');
    });

    // Mark as not featured
    casper.waitWhileSelector('.notification-success', function waitForNoSuccess() {
        this.click('.content-preview .featured');
    }, function onTimeout() {
        test.assert(false, 'Success notification wont go away:(');
    });

    casper.waitForSelector('.notification-success', function waitForSuccess() {
        test.assert(true, 'got success notification');
        test.assertSelectorHasText('.notification-success', 'Post successfully marked as not featured.');
        test.assertDoesntExist('.content-preview .featured');
        test.assertDoesntExist('.content-list-content li:first-child .featured');
    }, function onTimeout() {
        test.assert(false, 'Success notification wont go away:(');
    });
});

CasperTest.begin('Admin navigation bar is correct', 28, function suite(test) {
    casper.thenOpen(url + 'ghost/content/', function testTitleAndUrl() {
        test.assertTitle('Ghost Admin', 'Ghost admin has no title');
        test.assertUrlMatch(/ghost\/content\/$/, "Ghost doesn't require login this time");
    });

    casper.then(function testNavItems() {
        test.assertExists('a.ghost-logo', 'Ghost logo home page link exists');
        test.assertEquals(this.getElementAttribute('a.ghost-logo', 'href'), '/', 'Ghost logo href is correct');

        test.assertExists('#main-menu li.content a', 'Content nav item exists');
        test.assertSelectorHasText('#main-menu li.content a', 'Content', 'Content nav item has correct text');
        test.assertEquals(this.getElementAttribute('#main-menu li.content a', 'href'), '/ghost/', 'Content href is correct');
         test.assertEval(function testContentIsNotActive() {
            return document.querySelector('#main-menu li.content').classList.contains('active');
        }, 'Content nav item is marked active');

        test.assertExists('#main-menu li.editor a', 'Editor nav item exists');
        test.assertSelectorHasText('#main-menu li.editor a', 'New Post', 'Editor nav item has correct text');
        test.assertEquals(this.getElementAttribute('#main-menu li.editor a', 'href'), '/ghost/editor/', 'Editor href is correct');
        test.assertEval(function testEditorIsNotActive() {
            return !document.querySelector('#main-menu li.editor').classList.contains('active');
        }, 'Editor nav item is not marked active');

        test.assertExists('#main-menu li.settings a', 'Settings nav item exists');
        test.assertSelectorHasText('#main-menu li.settings a', 'Settings', 'Settings nav item has correct text');
        test.assertEquals(this.getElementAttribute('#main-menu li.settings a', 'href'), '/ghost/settings/', 'Settings href is correct');
        test.assertEval(function testSettingsIsActive() {
            return !document.querySelector('#main-menu li.settings').classList.contains('active');
        }, 'Settings nav item is not marked active');
    });

    casper.then(function testUserMenuNotVisible() {
        test.assertExists('#usermenu', 'User menu nav item exists');
        test.assertNotVisible('#usermenu ul.overlay', 'User menu should not be visible');
    });

    casper.thenClick('#usermenu a');
    casper.waitForSelector('#usermenu ul.overlay', function then() {
        test.assertVisible('#usermenu ul.overlay', 'User menu should be visible');

        test.assertExists('#usermenu li.usermenu-profile a', 'Profile menu item exists');
        test.assertSelectorHasText('#usermenu li.usermenu-profile a', 'Your Profile', 'Profile menu item has correct text');
        test.assertEquals(this.getElementAttribute('li.usermenu-profile a', 'href'), '/ghost/settings/user/', 'Profile href is correct');

        test.assertExists('#usermenu li.usermenu-help a', 'Help menu item exists');
        test.assertSelectorHasText('#usermenu li.usermenu-help a', 'Help / Support', 'Help menu item has correct text');
        test.assertEquals(this.getElementAttribute('li.usermenu-help a', 'href'), 'http://ghost.org/forum/', 'Help href is correct');

        test.assertExists('#usermenu li.usermenu-signout a', 'Sign Out menu item exists');
        test.assertSelectorHasText('#usermenu li.usermenu-signout a', 'Sign Out', 'Sign Out menu item has correct text');
        test.assertEquals(this.getElementAttribute('#usermenu li.usermenu-signout a', 'href'), '/ghost/signout/', 'Sign Out href is correct');
    });
});