module ApplicationHelper
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
end
