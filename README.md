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
points = Array.new(10000) do
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

## Pause and check our methodology
As I've been writing this code, I've started to suspect that my current implementation is going to cause major performance problems in the very near future.
I want to be able to resolve the current state of the map, but a query to get the last painted color of each pixel could take a very long time.
If you run `rails c` and then `Pixel.all.map {|p| p.color}`, the command will take a few seconds to run, and that's with only 1/10th of the amount of pixels needed to fill a 1000x1000 grid.

So I have a couple options:

1. Reduce the size of the Pixel grid to something that produces a reasonable request time.
2. Blatantly copy the reddit dev team's [post on how they build r/place](https://redditblog.com/2017/04/13/how-we-built-rplace/)

Option two it is! Rather than using a relational database to map out the individual pixels into an image, we're going to keep a representation of the state of the pixels by storing it as a [bitfield](https://redis.io/commands/bitfield).

When a user loads the app, the entire BITFIELD value will be served via a cached api with a very short expiration time. The bitmap will be loaded using `HTML Canvas#loadImageData()`. Websocket updates for pixels will be recorded and applied once the full image is loaded and displayed.  

When a user _"paints a pixel"_ a `Paint` record is created to associate the `User` and color. This the color is encoded and then placed at an offset.  

```
BITFIELD SET "pixelPlace" (x + 1000*y) color
``` 


## API Endpoints
Setup two endpoints to Painting Pixels and getting data on a single Pixel.
```ruby
# config/routes.rb
  resources :paints
  post 'paints/:x/:y', to: "paints#create"

  resources :pixels
  get 'pixels/:x/:y', to: "pixels#show"
```
```ruby
# app/controllers/pixels_controller.rb
class PixelsController < ApplicationController
    skip_before_action :verify_authenticity_token
    before_action :find_by_coordinates, only: [:show]

    def show
        # build up the response we want
        # kinda hacky but it works for now as we're not focusing on serialization for now
        pixel = @pixel.as_json(
            :except => [:updated_at]
        )
        pixel["color"] = @pixel.color

        pixel["paint"] = @pixel.last_paint.as_json(
            :include => {
                :user => {:only => [:username, :id]},
            },
            :except => [:id, :updated_at, :pixel_id, :user_id]
        )

        render json: pixel.to_json
    end

    private
        def find_by_coordinates
            x, y = params[:x], params[:y]
            @pixel = Pixel.find_by(x: x, y: y)
        end
end
```

```ruby
class PaintsController < ApplicationController
    skip_before_action :verify_authenticity_token

    def create
        # check if user Painted within cooldown period
        now = DateTime.now.utc
        last_paint = Paint.where(user: User.find(1)).last

        if last_paint && ( now.to_i - last_paint.created_at.to_i >= 5)
            color = paint_params[:color]
            x, y = params[:x], params[:y]
            @paint = Paint.create({
                color: color,
                user: User.find(1),

                pixel: Pixel.where(x: x, y: y).first_or_create
            })
            
            render json: @paint.to_json(
                :include => {
                    :user => {:only => [:username]},
                    :pixel => {:only => [:x, :y]}
                }, 
                :except => [:updated_at]
            )
        else
            render json: { errors: ["Wait your turn!"] }
        end
    end

    private
        def paint_params
            params.require(:paint).permit(:x, :y, :color)
        end
end

```

## Install and Configure Redis
We will be using a Redis `BITFIELD` to store our pixel data in binary format. `BITFIELD` affords us the ability to get the all the data in binary format, and address it with only an offset. We can easily calculate an offset with `(x + 1000*y)`.

Install Redis and the redis gem. [I'm using this tutorial](https://medium.com/@petehouston/install-and-config-redis-on-mac-os-x-via-homebrew-eb8df9a4f298)
```shell
# Mac
brew install redis
# Linux
sudo apt-get install redis
```

TODO:

Server:

- [x] decide whether this can be done without cassandra -> (yes)

- [x] add POST /api/paint/:x/:y endpoint 
- [x] add GET /api/pixel endpoint

- [x] ~~add color field to Pixel model~~
- [x] install redis
- [x] create bitmap in redis and use BITFIELD to access the key with an offset
- [x] on seed, generate a blank Bitmap
- [ ] on app start, check for and generate BITFIELD representation of Pixels
- [x] on Pixel change, update BITFIELD with color and offset

- [ ] setup websockets with ActionCable
- [ ] broadcast pixel update on Paint

- [x] cache /api/bitmap with 1 sec expiry
- [x] ~~on cache hit, serve bitmap~~
- [ ] ~~on cache miss, request BITFIELD from Redis~~
- [x] Don't iterate in with Ruby + Redis unless you have to. Batch commands, use the queue command, and commit often.


Client:

- [ ] add Canvas
- [ ] load bitmap image data from api endpoint
- [ ] handle pan and zoom
- [ ] subscribe to pixel updates via websocket
- [ ] color picker

## Postgresql vs CassandraDB
You should explain why you chose Postgres:
- easier setup: cassandra requires a robust server setup while postgres only needs a single server.
