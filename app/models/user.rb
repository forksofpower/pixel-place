class User < ApplicationRecord
    has_many :paints
    has_many :pixels, through: :paints
end
