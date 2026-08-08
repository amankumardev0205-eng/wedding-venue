import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FiPlus, FiX } from 'react-icons/fi';

const venueSchema = z.object({
  name: z.string().min(3, 'Venue name must be at least 3 characters'),
  city: z.string().min(2, 'City is required'),
  type: z.string().min(1, 'Venue type is required'),
  capacity: z.number().min(10, 'Capacity must be at least 10 guests'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  basePrice: z.number().min(0, 'Base price must be 0 or more'),
  buffetPrice: z.number().min(0, 'Buffet price must be 0 or more'),
  extraPrice: z.number().min(0, 'Extra price must be 0 or more'),
});

export default function VenueForm({ onSubmit, isLoading, initialData, isEditing }) {
  const [amenities, setAmenities] = useState(initialData?.amenities || []);
  const [amenityInput, setAmenityInput] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(initialData?.images?.[0]?.url || null);
  const [location, setLocation] = useState(initialData?.location || { latitude: 0, longitude: 0 });

  const mappedCapacity = initialData?.capacity
    ? (typeof initialData.capacity === 'object' ? (initialData.capacity.max || 100) : initialData.capacity)
    : 100;

  const mappedType = initialData?.type || initialData?.venueType || '';

  const mappedBasePrice = initialData?.pricing
    ? (initialData.pricing.perPlate || initialData.pricing.flatRate || initialData.pricing.base || 0)
    : 0;

  const mappedBuffetPrice = initialData?.pricing?.buffet || 0;
  const mappedExtraPrice = initialData?.pricing?.extra || 0;

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: zodResolver(venueSchema),
    defaultValues: {
      name: initialData?.name || '',
      city: initialData?.city || '',
      type: mappedType,
      capacity: mappedCapacity,
      description: initialData?.description || '',
      basePrice: mappedBasePrice,
      buffetPrice: mappedBuffetPrice,
      extraPrice: mappedExtraPrice,
    },
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddAmenity = () => {
    if (amenityInput.trim() && !amenities.includes(amenityInput.trim())) {
      setAmenities([...amenities, amenityInput.trim()]);
      setAmenityInput('');
    }
  };

  const handleRemoveAmenity = (amenity) => {
    setAmenities(amenities.filter((a) => a !== amenity));
  };

  const handleFormSubmit = (data) => {
    const formData = new FormData();

    // Add basic fields
    formData.append('name', data.name);
    formData.append('city', data.city);
    formData.append('type', data.type);
    formData.append('capacity', data.capacity);
    formData.append('description', data.description);

    // Add image if selected
    if (image) {
      formData.append('image', image);
    }

    // Add amenities as JSON
    formData.append('amenities', JSON.stringify(amenities));

    // Add pricing as JSON
    formData.append('pricing', JSON.stringify({
      base: data.basePrice,
      buffet: data.buffetPrice,
      extra: data.extraPrice,
    }));

    // Add location
    formData.append('location', JSON.stringify(location));

    onSubmit(formData);
  };

  const venueTypes = ['Banquet Hall', 'Garden', 'Palace', 'Hotel', 'Farm House', 'Beach', 'Restaurant', 'Club'];

  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">
        {isEditing ? 'Edit Venue' : 'Add New Venue'}
      </h2>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Venue Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Venue Name
          </label>
          <input
            type="text"
            {...register('name')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter venue name"
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
        </div>

        {/* City and Venue Type */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City
            </label>
            <input
              type="text"
              {...register('city')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Delhi"
            />
            {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Venue Type
            </label>
            <select
              {...register('type')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select type</option>
              {venueTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>}
          </div>
        </div>

        {/* Capacity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Guest Capacity
          </label>
          <input
            type="number"
            {...register('capacity', { valueAsNumber: true })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., 500"
            min="10"
          />
          {errors.capacity && <p className="text-red-500 text-sm mt-1">{errors.capacity.message}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            {...register('description')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Describe your venue..."
            rows="4"
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
        </div>

        {/* Pricing */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Pricing</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Base Price (per person)
              </label>
              <input
                type="number"
                {...register('basePrice', { valueAsNumber: true })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
                min="0"
              />
              {errors.basePrice && <p className="text-red-500 text-sm mt-1">{errors.basePrice.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buffet Price (per person)
              </label>
              <input
                type="number"
                {...register('buffetPrice', { valueAsNumber: true })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
                min="0"
              />
              {errors.buffetPrice && <p className="text-red-500 text-sm mt-1">{errors.buffetPrice.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Extra Charges
              </label>
              <input
                type="number"
                {...register('extraPrice', { valueAsNumber: true })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
                min="0"
              />
              {errors.extraPrice && <p className="text-red-500 text-sm mt-1">{errors.extraPrice.message}</p>}
            </div>
          </div>
        </div>

        {/* Amenities */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amenities
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={amenityInput}
              onChange={(e) => setAmenityInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAmenity())}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., AC, Parking, WiFi"
            />
            <button
              type="button"
              onClick={handleAddAmenity}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
            >
              <FiPlus /> Add
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {amenities.map((amenity) => (
              <span
                key={amenity}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center gap-2"
              >
                {amenity}
                <button
                  type="button"
                  onClick={() => handleRemoveAmenity(amenity)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <FiX />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Venue Image
          </label>
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">JPEG, PNG, GIF or WebP (Max 10MB)</p>
            </div>

            {imagePreview && (
              <div className="flex-shrink-0">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-24 w-24 object-cover rounded-lg border border-gray-300"
                />
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-400"
        >
          {isLoading ? 'Saving...' : isEditing ? 'Update Venue' : 'Add Venue'}
        </button>
      </form>
    </div>
  );
}
