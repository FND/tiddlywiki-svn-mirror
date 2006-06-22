class CreateDirectories < ActiveRecord::Migration
  def self.up
    create_table :directories do |t|
      # t.column :name, :string
    end
  end

  def self.down
    drop_table :directories
  end
end
