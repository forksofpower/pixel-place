class CreatePaints < ActiveRecord::Migration[6.0]
  def change
    create_table :paints do |t|
      t.references :user, null: false, foreign_key: true
      t.references :pixel, null: false, foreign_key: true
      t.string :color

      t.timestamps
    end
  end
end
