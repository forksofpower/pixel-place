### User Stories
#### A user should be able to...
- create an account and login using their google account
- change a pixel's color once during a time period
- view a full screen map of the pixels
- pan and zoom around the map of pixels
- watch pixels change on the map

### Models
`User >-- Paint --< Pixel`

### Create App
```shell
# Install Rails 6
gem install rails

# Generate a new Rails project.
# We are choosing to include only the extensions that we need in order to minimize boilerplate clutter.
rails new pixel-place -d postgresql --skip-action-mailbox --skip-action-text
          --skip-spring -T --skip-turbolinks
# Create the database
rake db:create

```
Configure rails generate less unecessary stuff.
```ruby
# config/application.rb
module PixelPlace
    class Application < Rails::Application
        ...
        # Don't generate things we don't need
        config.generators do |g|
            g.test_framework  false
            g.stylesheets     false
            g.javascripts     false
            g.helper          false
            g.channel         assets: false
        end
    end
end
```


### Add a frontend

Generate a controller for the root route
```shell
$ rails g controller place index
```

Set the root route to `place#index`
```ruby
# config/routes.rb
Rails.application.routes.draw do

  root "place#index"
end
```

Create a new `index.js` file in `app/javascript/packs` and add a test function to make sure its working.
```shell
touch app/javascript/packs/index.js
```
```javascript
// app/javascript/index.js
(function hello() {
    console.log("Hello, World!");
})()
```

Then add the associated `javascript_pack_tag`
```html
# app/views/place/index.html.erb
<div id="place" />
<%= javascript_pack_tag 'index' %>
```

Now, open your browser and navigate to `localhost:3000`. Open the inspector and you should see `Hello, World!` in the console output!