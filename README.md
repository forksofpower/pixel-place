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

## Model all the domains
For this project, we will have `Users` that modify the state of `Pixels` via `Paints`. A `Paint` will join a `User` and a `Pixel` as well as a `color` attribute.

```shell
# create User model
rails g resource User first_name last_name username email

# create pixel model
rails g resource Pixel x y

# create join model
rails g model Paint user:references pixel:references color:string
```

Don't forget to finish your associations.
```ruby
# app/models/user.rb
class User < ApplicationRecord
    has_many :paints
    has_many :pixels, through: :paints
end
```
```ruby
# app/models/pixel.rb
class Pixel < ApplicationRecord
    has_many :paints
    has_many :users, through: :paints
end
```

Setup some basic seed data
```ruby
# db/seeds.rb
def random_color(code="hex")
	rgb = []
	# generate 3 random color values
	3.times {rgb << (rand() * 255).floor}
	# Return the rgb array or convert to hex
	# if hex, take into account zero padding
	if code === "rgb"
		color = rgb
	else 
		color = rgb.reduce("#"){|x, y| x + ((y<=16) ? "0" : "") + y.to_s(16)}
	end
	color
end

# test user
user = User.create({
    first_name: "Testie",
    last_name: "McTesterson",
    username: "testify3000",
    email: "testify3000@gmail.com"
})

# generate random paints
points = Array.new(10) do
    [rand(-100..100), rand(-100..100)]
end

points.each do |x, y|
    Paint.create({
        user: user,
        pixel: Pixel.where(x: x, y: y).first_or_create,
        color: random_color
    })
end
```
```shell
# run seed
rails db:seed
```

## Show me the pixels!

