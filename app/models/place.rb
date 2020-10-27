class Place
    attr_accessor :BITMAP_NAME, :BITMAP_HEIGHT, :BITMAP_WIDTH, :BACKGROUND_COLOR, :BIT_WIDTH

    def self.create(name: 'place', height: 500, width: 500, background_color: 0xf)
        @BITMAP_NAME = name
        @BITMAP_HEIGHT = height
        @BITMAP_WIDTH = width
        @BACKGROUND_COLOR = background_color
        @BIT_WIDTH = 'u4'

        puts "✈️  Generating a bunch of pixels..."
        generate
        puts "💖  Finished generating #{(@BITMAP_HEIGHT * @BITMAP_WIDTH).to_f / 1000000} million pixels..."
    end

    def self.to_binary
        REDIS.with do |redis|
            return redis.get 'place'
        end
    end

    def self.set_pixel_color(x:, y:, color:)
        bitmap = Bitmap.last

        return false if !bitmap
        
        offset = (x + (bitmap.height * y))
        # color is a number 0-15
        # redis.bitfield('place', 'SET', 'u4', offset, color)
        # connect to redis
        REDIS.with do |redis|
            redis.bitfield(
                bitmap.name,
                'SET',
                bitmap.byte_width, 
                "##{offset}",
                color 
            )
        end
    end

    def self.generate
        bitmap = Bitmap.create({
            name: 'place',
            height: @BITMAP_HEIGHT,
            width: @BITMAP_WIDTH,
            byte_width: @BIT_WIDTH,
            background_color: @BACKGROUND_COLOR
        })
        REDIS.with do |redis|
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
                        # rand(0..15)
                        # create some fancy stripes to test
                        # (y % 10 === 0) ? @BACKGROUND_COLOR : rand(0..15)
                    )
                    # commit more often to avoid memory issues
                    redis.commit if y % 10 === 0
                end
                redis.commit
            end
        end
    end
end