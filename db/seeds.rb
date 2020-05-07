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
    first_name: "Patrick",
    last_name: "Jones",
    username: "forksofpower",
    email: "patrickjones.pmj@gmail.com"
})

# generate random paints
# points = Array.new(10000) do
#     [rand(-100..100), rand(-100..100)]
# end

# points.each do |x, y|
#     Paint.create({
#         user: user,
#         pixel: Pixel.where(x: x, y: y).first_or_create,
#         color: random_color
#     })
# end

# create redis client
# Generate grid of single color

# Delete existing place
redis = Redis.new
redis.del 'place'

bitmap = Place.create({
	height: 1000,
	width: 1000,
})
# BITMAP_WIDTH = 1000
# BITMAP_HEIGHT = 1000
# BIT_WIDTH = 'u4'

# BACKGROUND_COLOR = 0x0; # white

# PIXEL_COUNT = BITMAP_HEIGHT * BITMAP_WIDTH

# # FUCK, THIS GON' BE UGLY
# BITMAP_WIDTH.times do |x|
# 	BITMAP_HEIGHT.times do |y|
# 		redis.queue(
# 			'BITFIELD',
# 			'place', 'SET', BIT_WIDTH, "##{(x + (BITMAP_HEIGHT * y))}",
# 			# create some fancy stripes to test
# 			(y % 2 === 1) ? rand(0..255) : BACKGROUND_COLOR
# 		)
# 		# commit more often to avoid memory issues
# 		redis.commit if y % 10 === 0
# 	end
# 	redis.commit
# end
# puts "Finished generating #{PIXEL_COUNT.to_f / 1000000} million pixels..."