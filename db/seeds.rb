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