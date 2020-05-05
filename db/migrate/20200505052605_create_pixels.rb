class CreatePixels < ActiveRecord::Migration[6.0]
  def change
    create_table :pixels do |t|
      t.bigint :x
      t.bigint :y

      t.timestamps
    end
  end
end