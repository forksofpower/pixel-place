Rails.application.routes.draw do

  resources :paints
  post 'paints/:x/:y', to: "paints#create"

  resources :pixels
  resources :users
  root "place#index"
end
