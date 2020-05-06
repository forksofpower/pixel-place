class CreateBitmaps < ActiveRecord::Migration[6.0]
  def change
    create_table :bitmaps do |t|
      t.integer :width
      t.integer :height
      t.string :byte_width
      t.string :background_color
      t.string :name

      t.timestamps
    end
  end
end
