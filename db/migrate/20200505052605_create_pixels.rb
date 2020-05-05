class CreatePixels < ActiveRecord::Migration[6.0]
  def change
    create_table :pixels do |t|
      t.string :x
      t.string :y

      t.timestamps
    end
  end
end
