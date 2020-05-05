class Pixel < ApplicationRecord
    has_many :paints
    has_many :users, through: :paints



    scope :by_x, -> (min, max) { min && max ? where('x >= :min AND x <= :max', min: min, max: max) : all }
    scope :by_y, -> (min, max) { min && max ? where('y >= :min AND y <= :max', min: min, max: max) : all }

    def self.search_within_bounds(min_y:, max_y:, min_x:, max_x:)
        by_y(min_y, max_y).
        by_x(min_x, max_x)
    end

    def color
        # get the last color added
        self.paints.last.color
    end
end
