import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, X, Tag, DollarSign, Image } from 'lucide-react';

// UI components
import Button from './ui/Button';
import Input from './ui/Input';
import Select from './ui/Select';
import { Card, CardContent } from './ui/Card';
import Badge from './ui/Badge';

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
    register,
    handleSubmit,
    formState: { errors },
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
    <Card className="border border-[var(--border-medium)] shadow-sm max-w-2xl mx-auto">
      <CardContent className="p-6 md:p-8 flex flex-col gap-6">
        
        <h2 className="font-serif text-2xl font-bold text-[var(--text-dark)] border-b border-[var(--border-light)] pb-3 select-none">
          {isEditing ? 'Edit Venue Listing' : 'Add New Venue Listing'}
        </h2>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          
          {/* Venue Name */}
          <Input
            label="Venue Name"
            type="text"
            placeholder="e.g., The Heritage Grand Palace"
            error={errors.name?.message}
            {...register('name')}
          />

          {/* City and Venue Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="City"
              type="text"
              placeholder="e.g., Udaipur"
              error={errors.city?.message}
              {...register('city')}
            />

            <Select
              label="Venue Type"
              error={errors.type?.message}
              {...register('type')}
            >
              <option value="">Select type</option>
              {venueTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
          </div>

          {/* Capacity */}
          <Input
            label="Guest Capacity (Maximum)"
            type="number"
            placeholder="e.g., 500"
            error={errors.capacity?.message}
            {...register('capacity', { valueAsNumber: true })}
          />

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] select-none">
              Venue Description
            </label>
            <textarea
              placeholder="Describe the venue style, settings, packages, and historical details..."
              {...register('description')}
              rows="4"
              className="w-full text-sm bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 hover:border-stone-300 dark:hover:border-stone-800 transition duration-150 text-[var(--text-body)]"
            />
            {errors.description && (
              <p className="text-xs font-semibold text-red-500 mt-1 select-none">{errors.description.message}</p>
            )}
          </div>

          {/* Pricing Details */}
          <div className="border-t border-[var(--border-light)] pt-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-primary mb-4 flex items-center gap-1.5 select-none">
              <DollarSign size={14} />
              <span>Pricing Packages (INR)</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Base Price (person)"
                type="number"
                placeholder="0"
                error={errors.basePrice?.message}
                {...register('basePrice', { valueAsNumber: true })}
              />

              <Input
                label="Buffet Price (person)"
                type="number"
                placeholder="0"
                error={errors.buffetPrice?.message}
                {...register('buffetPrice', { valueAsNumber: true })}
              />

              <Input
                label="Extra Charges"
                type="number"
                placeholder="0"
                error={errors.extraPrice?.message}
                {...register('extraPrice', { valueAsNumber: true })}
              />
            </div>
          </div>

          {/* Amenities Management */}
          <div className="border-t border-[var(--border-light)] pt-5 flex flex-col gap-2">
            <label className="text-sm font-bold text-[var(--text-dark)] flex items-center gap-1.5 select-none">
              <Tag size={14} className="text-primary" />
              <span>Configure Amenities</span>
            </label>
            <div className="flex gap-2 select-none">
              <input
                type="text"
                value={amenityInput}
                onChange={(e) => setAmenityInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAmenity())}
                className="flex-1 text-sm bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-[var(--text-body)]"
                placeholder="e.g., AC, Parking, WiFi, Pool"
              />
              <Button
                type="button"
                onClick={handleAddAmenity}
                variant="outline"
                className="font-bold border-stone-200 shrink-0"
                leftIcon={<Plus size={14} />}
              >
                Add
              </Button>
            </div>

            {/* Added list of amenities */}
            {amenities.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2 select-none">
                {amenities.map((amenity) => (
                  <Badge 
                    key={amenity}
                    variant="primary" 
                    className="capitalize text-xs font-semibold py-1 pl-3 pr-1.5 flex items-center gap-1 bg-primary/5 text-primary border-primary/10"
                  >
                    <span>{amenity}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAmenity(amenity)}
                      className="h-4 w-4 rounded-full flex items-center justify-center hover:bg-primary/10 text-primary transition-all duration-150 cursor-pointer"
                      aria-label={`Remove amenity: ${amenity}`}
                    >
                      <X size={11} />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Image Upload section */}
          <div className="border-t border-[var(--border-light)] pt-5 flex flex-col gap-3">
            <label className="text-sm font-bold text-[var(--text-dark)] flex items-center gap-1.5 select-none">
              <Image size={14} className="text-primary" />
              <span>Venue Image Showcase</span>
            </label>
            <div className="flex flex-col sm:flex-row gap-4 items-start select-none">
              <div className="flex-1 w-full">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full text-xs text-stone-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary/5 file:text-primary file:cursor-pointer hover:file:bg-primary/10 transition file:duration-150"
                />
                <p className="text-xs text-[var(--text-muted)] mt-1.5 font-semibold">JPEG, PNG, GIF or WebP (Max 10MB)</p>
              </div>

              {imagePreview && (
                <div className="flex-shrink-0 border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden shadow-inner h-20 w-20">
                  <img
                    src={imagePreview}
                    alt="Venue Preview"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Submit Action */}
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            className="w-full py-3.5 font-bold shadow-sm select-none"
          >
            {isLoading ? 'Saving changes...' : isEditing ? 'Update Venue Listing' : 'Publish Venue Listing'}
          </Button>

        </form>

      </CardContent>
    </Card>
  );
}
