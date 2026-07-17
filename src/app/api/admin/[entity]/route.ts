import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const modelMapping: { [key: string]: string } = {
  profile: 'profile',
  settings: 'setting',
  education: 'education',
  timeline: 'timelineEvent',
  skills: 'skill',
  projects: 'project',
  certifications: 'certification',
  internships: 'internship',
  achievements: 'achievement',
  gallery: 'galleryItem',
  messages: 'message',
};

const jsonFieldsMapping: { [key: string]: string[] } = {
  project: ['screenshots', 'tags', 'logs', 'challenges', 'solutions'],
  certification: ['skills'],
  internship: ['skills'],
};

// GET: Fetch records
export async function GET(
  request: Request,
  { params }: { params: Promise<{ entity: string }> }
) {
  try {
    const { entity } = await params;
    const modelName = modelMapping[entity];

    if (!modelName) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    const model = (prisma as any)[modelName];

    // Singular items
    if (modelName === 'profile' || modelName === 'setting') {
      const record = await model.findFirst();
      return NextResponse.json(record || {});
    }

    // List items, order by id/displayOrder if applicable
    let records;
    if (modelName === 'timelineEvent' || modelName === 'skill') {
      records = await model.findMany({ orderBy: { displayOrder: 'asc' } });
    } else if (modelName === 'message') {
      records = await model.findMany({ orderBy: { createdAt: 'desc' } });
    } else {
      records = await model.findMany({ orderBy: { id: 'asc' } });
    }

    // Parse JSON string fields back to arrays for client convenience
    const parsedRecords = records.map((record: any) => {
      const copy = { ...record };
      const modelJsonFields = jsonFieldsMapping[modelName] || [];
      for (const key of modelJsonFields) {
        if (copy[key] && typeof copy[key] === 'string') {
          try {
            copy[key] = JSON.parse(copy[key]);
          } catch (e) {
            // Keep as string if parsing fails
          }
        }
      }
      return copy;
    });

    return NextResponse.json(parsedRecords);
  } catch (error: any) {
    console.error('API GET Error:', error);
    return NextResponse.json({ error: 'Failed to retrieve data' }, { status: 500 });
  }
}

// POST: Create a record
export async function POST(
  request: Request,
  { params }: { params: Promise<{ entity: string }> }
) {
  try {
    const { entity } = await params;
    const modelName = modelMapping[entity];

    if (!modelName || modelName === 'profile' || modelName === 'setting') {
      return NextResponse.json({ error: 'Method not allowed for this resource' }, { status: 405 });
    }

    const body = await request.json();
    const model = (prisma as any)[modelName];

    // Prepare JSON arrays as strings for SQLite
    const preparedData = { ...body };
    delete preparedData.id; // Strip ID on create

    const modelJsonFields = jsonFieldsMapping[modelName] || [];
    for (const key of modelJsonFields) {
      if (preparedData[key] && Array.isArray(preparedData[key])) {
        preparedData[key] = JSON.stringify(preparedData[key]);
      } else if (preparedData[key] === undefined) {
        preparedData[key] = '[]';
      }
    }

    const newRecord = await model.create({ data: preparedData });
    return NextResponse.json(newRecord, { status: 201 });
  } catch (error: any) {
    console.error('API POST Error:', error);
    return NextResponse.json({ error: 'Failed to create record' }, { status: 500 });
  }
}

// PUT: Update a record
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ entity: string }> }
) {
  try {
    const { entity } = await params;
    const modelName = modelMapping[entity];

    if (!modelName) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    const body = await request.json();
    const model = (prisma as any)[modelName];

    // Singular items update
    if (modelName === 'profile' || modelName === 'setting') {
      const existing = await model.findFirst();
      
      const preparedData = { ...body };
      delete preparedData.id;

      let record;
      if (existing) {
        record = await model.update({
          where: { id: existing.id },
          data: preparedData,
        });
      } else {
        record = await model.create({ data: preparedData });
      }
      return NextResponse.json(record);
    }

    // List items update
    const { id, ...dataToUpdate } = body;
    if (!id) {
      return NextResponse.json({ error: 'Record ID is required for update' }, { status: 400 });
    }

    // Prepare JSON arrays as strings for SQLite
    const modelJsonFields = jsonFieldsMapping[modelName] || [];
    for (const key of modelJsonFields) {
      if (dataToUpdate[key] !== undefined) {
        dataToUpdate[key] = Array.isArray(dataToUpdate[key])
          ? JSON.stringify(dataToUpdate[key])
          : String(dataToUpdate[key]);
      }
    }

    const updatedRecord = await model.update({
      where: { id: Number(id) },
      data: dataToUpdate,
    });

    return NextResponse.json(updatedRecord);
  } catch (error: any) {
    console.error('API PUT Error:', error);
    return NextResponse.json({ error: 'Failed to update record' }, { status: 500 });
  }
}

// DELETE: Remove a record
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ entity: string }> }
) {
  try {
    const { entity } = await params;
    const modelName = modelMapping[entity];

    if (!modelName || modelName === 'profile' || modelName === 'setting') {
      return NextResponse.json({ error: 'Method not allowed for this resource' }, { status: 405 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Record ID is required' }, { status: 400 });
    }

    const model = (prisma as any)[modelName];
    await model.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true, message: 'Record deleted successfully' });
  } catch (error: any) {
    console.error('API DELETE Error:', error);
    return NextResponse.json({ error: 'Failed to delete record' }, { status: 500 });
  }
}
