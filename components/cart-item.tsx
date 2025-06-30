import Image from 'next/image';

interface CartItemProperties {
  readonly title: string;
  readonly salePrice: number;
  readonly quantity: number;
  readonly image: string;
}

export function CartItem({
  title,
  salePrice,
  quantity,
  image,
}: CartItemProperties) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <Image
        src={image || '/placeholder.svg'}
        alt={title}
        width={64}
        height={64}
        className="rounded-lg object-cover"
      />
      <div className="flex-1">
        <h4 className="mb-1 text-sm font-medium">{title}</h4>
        <div className="flex items-center justify-between">
          <span className="font-bold text-green-600">
            ${salePrice.toFixed(2)}
          </span>
          <span className="text-sm text-gray-500">{quantity}X</span>
        </div>
      </div>
    </div>
  );
}
