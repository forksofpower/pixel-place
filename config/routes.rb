Rails.application.routes.draw do

  devise_for :users
  # resources :paints
  post 'paints/:x/:y', to: "paints#create"

  # resources :pixels
  get 'pixels/:x/:y', to: "pixels#show"

  get 'bitmap', to: 'bitmap#show'

  resources :users
  root "place#index"
end
