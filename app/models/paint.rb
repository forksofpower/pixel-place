class Paint < ApplicationRecord
  belongs_to :user
  belongs_to :pixel
end
