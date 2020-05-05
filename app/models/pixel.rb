class Pixel < ApplicationRecord
    has_many :paints
    has_many :users, through: :paints
end
