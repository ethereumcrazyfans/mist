/**
@module MistAPI Backend
*/

/**
Filters a id the id to only contain a-z A-Z 0-9 _ -.

@method filterId
*/
var filterId = function(str) {
    var newStr = '';
    for (var i = 0; i < str.length; i++) {
        if(/[a-zA-Z0-9_-]/.test(str.charAt(i)))
            newStr += str.charAt(i);
    };
    return newStr;
};


var sound = {
    bip: document.createElement('audio'),
    bloop: document.createElement('audio'),
    invite: document.createElement('audio'),
};
sound.bip.src = 'file://'+ dirname + '/../../sounds/bip.mp3';
sound.bloop.src = 'file://'+ dirname + '/../../sounds/bloop.mp3';
sound.invite.src = 'file://'+ dirname + '/../../sounds/invite.mp3';


/**
The backend side of the mist API.

@method mistAPIBackend
*/
mistAPIBackend = function(event) {
    var template = this.template;
    var webview = this.webview;
    var arg = event.args[0];


    if(event.channel === 'setWebviewId') {
        Tabs.update(template.data._id, {$set:{
            webviewId: webview.getId()
        }});
    }

    // Send TEST DATA
    if(event.channel === 'sendTestData') {
         webview.send('sendTestData', Tabs.findOne('tests'));
    }

    // SET FAVICON
    if(event.channel === 'favicon') {
        Tabs.update(template.data._id, {$set:{
            icon: arg
        }});
    }

    console.log("event.channel", event.channel);
    // SET FAVICON
    if(event.channel === 'appBar') {
        console.log('appBar arg',arg);
        Tabs.update(template.data._id, {$set:{
            appBar: arg
        }});
    }

    if(event.channel === 'mistAPI_sound') {
        sound[arg].play();
    }

    // STOP HERE, IF BROWSER
    if(template.data._id === 'browser')
        return;

    // Actions: --------

    if(event.channel === 'mistAPI_setBadge') {
        Tabs.update(template.data._id, {$set:{
            badge: arg
        }});
    }

    if(event.channel === 'mistAPI_menuChanges' && arg instanceof Array) {
        arg.forEach(function(arg){

            if(arg.action === 'addMenu') {
                // filter ID
                if(arg.entry && arg.entry.id)
                    arg.entry.id = filterId(arg.entry.id);
                
                var query = {'$set': {}};

                if(arg.entry.id)
                    query['$set']['menu.'+ arg.entry.id +'.id'] = arg.entry.id;

                query['$set']['menu.'+ arg.entry.id +'.selected'] = !!arg.entry.selected;

                if(!_.isUndefined(arg.entry.position))
                    query['$set']['menu.'+ arg.entry.id +'.position'] = arg.entry.position;
                if(!_.isUndefined(arg.entry.name))
                    query['$set']['menu.'+ arg.entry.id +'.name'] = arg.entry.name;
                if(!_.isUndefined(arg.entry.badge))
                    query['$set']['menu.'+ arg.entry.id +'.badge'] = arg.entry.badge;

                Tabs.update(template.data._id, query);
            }

            if(arg.action === 'removeMenu') {
                var query = {'$unset': {}};

                query['$unset']['menu.'+ arg.id] = '';

                Tabs.update(template.data._id, query);
            }

            if(arg.action === 'clearMenu') {
                Tabs.update(template.data._id, {$set: {menu: {}}});
            }
        });
    }
};