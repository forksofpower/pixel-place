class Place
    attr_accessor :BITMAP_NAME, :BITMAP_HEIGHT, :BITMAP_WIDTH, :BACKGROUND_COLOR, :BIT_WIDTH

    def self.create(name: 'place', height: 500, width: 500)
        @BITMAP_NAME = name
        @BITMAP_HEIGHT = height
        @BITMAP_WIDTH = width
        @BACKGROUND_COLOR = 0xf
        @BIT_WIDTH = 'u4'

        puts "✈️  Generating a bunch of pixels..."
        generate
        puts "💖  Finished generating #{(@BITMAP_HEIGHT * @BITMAP_WIDTH).to_f / 1000000} million pixels..."
    end

    def self.to_binary
        redis = Redis.new
        redis.get 'place'
    end

    def self.set_pixel_color(x:, y:, color:)
        bitmap = Bitmap.last
        
        return false if !bitmap
        # connect to redis
        redis = Redis.new

        offset = (x + (bitmap.height * y))
        redis.bitfield(
            bitmap.name,
            'SET',
            bitmap.byte_width, 
            "##{offset}",
            color 
        )
    end

    def self.generate
        bitmap = Bitmap.create({
            name: 'place',
            height: @BITMAP_HEIGHT,
            width: @BITMAP_WIDTH,
            byte_width: @BIT_WIDTH,
            background_color: @BACKGROUND_COLOR
        })
        redis = Redis.new
        # this could take a while. Do not call from a request
        # nested arrays are probably not necessary
        @BITMAP_HEIGHT.times do |y|
            @BITMAP_WIDTH.times do |x|
                redis.queue(
                    'BITFIELD',
                    @BITMAP_NAME, 'SET',
                    @BIT_WIDTH,
                    # (x + width * y)
                    "##{(x + (@BITMAP_HEIGHT * y))}",
                    @BACKGROUND_COLOR
                    # create some fancy stripes to test
                    # (y % 2 === 0) ? rand(0..255) : @BACKGROUND_COLOR
                )
                # commit more often to avoid memory issues
                redis.commit if y % 10 === 0
            end
            redis.commit
        end
    end
end